import { NextResponse } from 'next/server'

function getConfig() {
  const base = process.env.ONDORSE_API_URL
  const key = process.env.ONDORSE_API_KEY
  if (!base || !key) throw new Error('Missing env variables')
  return { base, key }
}

export async function GET() {
  try {
    const { base, key } = getConfig()
    // Use /api/custom_fields (non-portal endpoint, works with API key)
    // then filter display_in_portal === true to replicate /api/portal/custom_fields behavior
    const res = await fetch(`${base}/api/custom_fields`, {
      headers: { Authorization: key, 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[custom-fields] Ondorse error:', res.status, text)
      return NextResponse.json({ customFields: [] })
    }

    const data = await res.json()
    const allFields = Array.isArray(data) ? data : (data.custom_fields ?? data.data ?? [])

    // Filter: only fields marked for portal display
    const fields = allFields.filter((f: Record<string, unknown>) => f.display_in_portal === true)

    console.log('[custom-fields] Loaded:', allFields.length, 'total,', fields.length, 'for portal')

    const result = fields
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((a.display_order_in_portal as number) ?? 0) - ((b.display_order_in_portal as number) ?? 0)
      )
      .map((f: Record<string, unknown>) => ({
        id: f.id as string,
        name: (f.display_name as string) || (f.name as string) || 'Field',
        slug: (f.name as string) || '',
        field_type: (f.type as string) || 'string',
        is_required: !!(f.required_in_portal ?? f.is_required ?? false),
        description: (f.description as string) || undefined,
        options: (f.accepted_values as string[]) || undefined,
        display_order: (f.display_order_in_portal as number) ?? 0,
      }))

    return NextResponse.json({ customFields: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[custom-fields] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
