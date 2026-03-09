import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/ondorse'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = file instanceof File ? file.name : 'upload'
    const mimeType = file.type || 'application/octet-stream'

    const result = await uploadFile(buffer, fileName, mimeType)
    return NextResponse.json({ fileId: result.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
