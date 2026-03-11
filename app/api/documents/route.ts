import { NextRequest, NextResponse } from 'next/server'

function getConfig() {
  const base = process.env.ONDORSE_API_URL
  const key = process.env.ONDORSE_API_KEY
  if (!base || !key) throw new Error('Missing env variables')
  return { base, key }
}

interface DocumentRequest {
  name: string
  expectedDocumentId: string
  files: { fileId: string; side: 'front' | 'back' }[]
  // One of these must be set
  applicationId?: string
  personId?: string
}

export async function POST(req: NextRequest) {
  try {
    const { documents } = await req.json() as { documents: DocumentRequest[] }

    if (!documents?.length) {
      return NextResponse.json({ error: 'Missing documents' }, { status: 400 })
    }

    const { base, key } = getConfig()
    const results = []

    for (const doc of documents) {
      const body: Record<string, unknown> = {
        name: doc.name,
        expected_document_id: doc.expectedDocumentId,
        document_files: doc.files.map((f) => ({
          file_id: f.fileId,
          side: f.side,
        })),
      }

      // Only one of application_id or person_id
      if (doc.personId) {
        body.person_id = doc.personId
      } else if (doc.applicationId) {
        body.application_id = doc.applicationId
      }

      console.log('[documents] Creating document:', JSON.stringify(body))
      const res = await fetch(`${base}/api/documents`, {
        method: 'POST',
        headers: { Authorization: key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('[documents] Ondorse error:', res.status, text)
        results.push({ name: doc.name, error: text })
      } else {
        const data = await res.json()
        console.log('[documents] Created:', data.id)
        results.push({ name: doc.name, documentId: data.id })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[documents] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
