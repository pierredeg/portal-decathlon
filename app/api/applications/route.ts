import { NextRequest, NextResponse } from 'next/server'
import { createApplication } from '@/lib/ondorse'

export async function POST(req: NextRequest) {
  console.log('[DEBUG] ONDORSE_API_URL:', process.env.ONDORSE_API_URL)
  console.log('[DEBUG] ONDORSE_API_KEY defined:', !!process.env.ONDORSE_API_KEY, 'length:', process.env.ONDORSE_API_KEY?.length)
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
