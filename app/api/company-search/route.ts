import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')
  const country = searchParams.get('country') ?? 'FRA'

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const key = process.env.ONDORSE_API_KEY
  const base = process.env.ONDORSE_API_URL
  if (!key || !base) {
    return NextResponse.json({ error: 'Missing env variables' }, { status: 500 })
  }

  const url = `${base}/api/companies/${country}/search?q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: { Authorization: key },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[company-search] Ondorse error:', res.status, text)
    return NextResponse.json({ error: text }, { status: res.status })
  }

  const data = await res.json()
  console.log('[company-search] response sample:', JSON.stringify(data).slice(0, 500))
  return NextResponse.json(data)
}
