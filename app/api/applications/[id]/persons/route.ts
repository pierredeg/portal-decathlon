import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const key = process.env.ONDORSE_API_KEY
  const base = process.env.ONDORSE_API_URL
  if (!key || !base) {
    return NextResponse.json({ error: 'Missing env variables' }, { status: 500 })
  }

  const res = await fetch(`${base}/api/applications/${id}/persons`, {
    headers: { Authorization: key },
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text }, { status: res.status })
  }

  return NextResponse.json(await res.json())
}
