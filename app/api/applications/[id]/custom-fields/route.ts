import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const key = process.env.ONDORSE_API_KEY
  const base = process.env.ONDORSE_API_URL
  if (!key || !base) {
    return NextResponse.json({ error: 'Missing env variables' }, { status: 500 })
  }

  try {
    const body = await req.json()

    // Use PUT /api/applications/{id} (non-portal endpoint, works with API key)
    const res = await fetch(`${base}/api/applications/${id}`, {
      method: 'PUT',
      headers: { Authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        custom_fields: body.custom_fields,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[custom-fields] Ondorse update error:', res.status, text)
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    console.log('[custom-fields] Updated:', data.custom_fields)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[custom-fields] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
