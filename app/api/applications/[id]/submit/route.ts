import { NextRequest, NextResponse } from 'next/server'
import { submitApplication } from '@/lib/ondorse'

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await submitApplication(id)
    return NextResponse.json({ submitted: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[submit] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
