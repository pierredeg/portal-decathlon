import { NextResponse } from 'next/server'

function getConfig() {
  const base = process.env.ONDORSE_API_URL
  const key = process.env.ONDORSE_API_KEY
  if (!base || !key) throw new Error('Missing env variables')
  return { base, key }
}

export async function GET() {
  const { base, key } = getConfig()
  const headers = { Authorization: key, 'Content-Type': 'application/json' }

  try {
    // 1. Get portal configuration to determine portal type and expected document IDs
    let expectedDocumentIds: string[] = []
    let portalType: string | null = null

    const portalRes = await fetch(`${base}/api/portal/configuration`, { headers })
    if (portalRes.ok) {
      const portalConfig = await portalRes.json()
      console.log('[portal-config] Portal config:', JSON.stringify(portalConfig).slice(0, 2000))
      portalType = portalConfig.portalType ?? portalConfig.portal_type ?? null
      const steps = portalConfig.steps ?? portalConfig.portal_steps ?? []
      for (const step of steps) {
        // Find the "documents" step and extract expectedDocumentsIds from data
        if (step.step === 'documents' || step.type === 'documents') {
          const ids = step.data?.expectedDocumentsIds ?? step.data?.expected_documents_ids
            ?? step.expectedDocumentsIds ?? step.expected_documents_ids
          if (Array.isArray(ids)) expectedDocumentIds.push(...ids)
        }
      }
      console.log('[portal-config] Portal type:', portalType, '| Doc IDs from steps:', expectedDocumentIds)
    } else {
      console.log('[portal-config] Portal config not available:', portalRes.status)
    }

    // 2. Get expected documents configuration (full metadata)
    const expectedDocsRes = await fetch(`${base}/api/expected_documents_configuration`, { headers })
    if (!expectedDocsRes.ok) {
      const text = await expectedDocsRes.text()
      console.error('[portal-config] Expected docs config failed:', expectedDocsRes.status, text)
      return NextResponse.json({ expectedDocuments: [], expectedDocumentIds })
    }

    const allExpectedDocs = await expectedDocsRes.json()
    const docs = Array.isArray(allExpectedDocs) ? allExpectedDocs : []
    console.log('[portal-config] Expected docs count:', docs.length)

    // 3. Filter documents based on portal type and configuration
    let filtered: Record<string, unknown>[]

    if (expectedDocumentIds.length > 0) {
      // Collect or onboarding portal with explicit document step → use IDs as source of truth
      filtered = docs.filter((d: Record<string, unknown>) => expectedDocumentIds.includes(d.id as string))
      console.log('[portal-config] Filtered by step IDs:', filtered.length, 'docs')
    } else if (portalType === 'onboarding' || portalType === null) {
      // Onboarding portal without explicit step, or no portal config available →
      // filter by onboarding_document flag (safe fallback, never show all)
      filtered = docs.filter((d: Record<string, unknown>) => d.onboarding_document === true)
      console.log('[portal-config] Filtered by onboarding_document flag:', filtered.length, 'docs')
    } else {
      // Collect portal but no expectedDocumentsIds → config error, show nothing
      console.warn('[portal-config] Collect portal with no expectedDocumentsIds in steps — showing no documents')
      filtered = []
    }

    const result = filtered.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      name: (d.name as string) || (d.slug as string) || 'Document',
      slug: (d.slug as string) || '',
      is_mandatory: !!(d.is_required_in_onboarding_portal ?? d.is_mandatory ?? false),
      attached_to: (d.attached_to as string) || 'APPLICATION_BUSINESS',
    }))

    return NextResponse.json({ expectedDocuments: result, expectedDocumentIds })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[portal-config] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
