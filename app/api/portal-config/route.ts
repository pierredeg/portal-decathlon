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
    // 1. Try to get portal configuration (for expectedDocumentsIds)
    let expectedDocumentIds: string[] = []

    const portalRes = await fetch(`${base}/api/portal/configuration`, { headers })
    if (portalRes.ok) {
      const portalConfig = await portalRes.json()
      console.log('[portal-config] Portal config:', JSON.stringify(portalConfig).slice(0, 2000))
      // Extract expectedDocumentsIds from steps
      const steps = portalConfig.steps ?? portalConfig.portal_steps ?? []
      for (const step of steps) {
        if (step.expectedDocumentsIds) expectedDocumentIds.push(...step.expectedDocumentsIds)
        if (step.expected_documents_ids) expectedDocumentIds.push(...step.expected_documents_ids)
        // Also check nested data
        if (step.data?.expectedDocumentsIds) expectedDocumentIds.push(...step.data.expectedDocumentsIds)
      }
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
    console.log('[portal-config] Expected docs count:', Array.isArray(allExpectedDocs) ? allExpectedDocs.length : 'not array')
    console.log('[portal-config] Expected docs sample:', JSON.stringify(allExpectedDocs).slice(0, 2000))

    // If we have portal-specific IDs, filter; otherwise return all
    const docs = Array.isArray(allExpectedDocs) ? allExpectedDocs : []
    const filtered = expectedDocumentIds.length > 0
      ? docs.filter((d: Record<string, unknown>) => expectedDocumentIds.includes(d.id as string))
      : docs

    const result = filtered.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      name: (d.name as string) || (d.slug as string) || 'Document',
      slug: (d.slug as string) || '',
      is_mandatory: !!(d.is_required_in_onboarding_portal ?? d.is_mandatory ?? true),
      attached_to: (d.attached_to as string) || 'APPLICATION_BUSINESS',
    }))

    return NextResponse.json({ expectedDocuments: result, expectedDocumentIds })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[portal-config] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
