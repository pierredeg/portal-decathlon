import { NextRequest, NextResponse } from 'next/server'
import { createDocument } from '@/lib/ondorse'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createDocument(body)
    return NextResponse.json({ documentId: result.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
