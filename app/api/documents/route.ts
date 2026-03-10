import { NextRequest, NextResponse } from 'next/server'

function getConfig() {
  const base = process.env.ONDORSE_API_URL
  const key = process.env.ONDORSE_API_KEY
  if (!base || !key) throw new Error('Missing env variables')
  return { base, key }
}

export async function POST(req: NextRequest) {
  try {
    const { applicationId, documents } = await req.json() as {
      applicationId: string
      documents: { fileId: string; expectedDocumentId: string }[]
    }

    if (!applicationId || !documents?.length) {
      return NextResponse.json({ error: 'Missing applicationId or documents' }, { status: 400 })
    }

    const { base, key } = getConfig()
    const results = []

    for (const { fileId, expectedDocumentId } of documents) {
      console.log('[documents] Creating document:', { applicationId, fileId, expectedDocumentId })
      const res = await fetch(`${base}/api/documents`, {
        method: 'POST',
        headers: { Authorization: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          file_id: fileId,
          expected_document_id: expectedDocumentId,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('[documents] Ondorse error:', res.status, text)
        results.push({ fileId, error: text })
      } else {
        const data = await res.json()
        console.log('[documents] Created:', data.id)
        results.push({ fileId, documentId: data.id })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[documents] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
