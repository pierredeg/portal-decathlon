import { NextRequest, NextResponse } from 'next/server'
import { createApplication } from '@/lib/ondorse'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createApplication({
      business: body.business,
      external_reference: body.external_reference,
    })
    return NextResponse.json({ applicationId: result.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
