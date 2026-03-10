import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const siren = searchParams.get('siren')
  const country = searchParams.get('country') ?? 'FRA'

  if (!siren) {
    return NextResponse.json({ error: 'Missing siren' }, { status: 400 })
  }

  const key = process.env.ONDORSE_API_KEY
  const base = process.env.ONDORSE_API_URL
  if (!key || !base) {
    return NextResponse.json({ error: 'Missing env variables' }, { status: 500 })
  }

  const url = `${base}/api/companies/${country}/${encodeURIComponent(siren)}`
  const res = await fetch(url, {
    headers: { Authorization: key },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[company-details] Ondorse error:', res.status, text)
    return NextResponse.json({ error: text }, { status: res.status })
  }

  const data = await res.json()
  console.log('[company-details] response:', JSON.stringify(data).slice(0, 1000))
  return NextResponse.json(data)
}
