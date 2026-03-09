function getConfig() {
  const base = process.env.ONDORSE_API_URL
  const key = process.env.ONDORSE_API_KEY
  if (!base || !key) {
    throw new Error('Missing ONDORSE_API_URL or ONDORSE_API_KEY env variables')
  }
  return { base, key }
}

function authHeaders(): Record<string, string> {
  const { key } = getConfig()
  return {
    Authorization: key,
    'Content-Type': 'application/json',
  }
}

function baseUrl(): string {
  return getConfig().base
}

export interface ApplicationPayload {
  business: {
    organization_name: string
    country: string
    legal_form?: string
    registration_number?: string
    address?: string
  }
  external_reference: string
}

export interface PersonPayload {
  given_names: string
  last_name: string
  email?: string
  roles: string[]
  direct_ownership_percentage?: number
  nationalities?: string[]
  birth_date?: string
  address_single_line?: string
}

export interface DocumentPayload {
  application_id: string
  person_id?: string
  type: string
  file_id: string
  side?: 'front' | 'back'
}

export async function createApplication(payload: ApplicationPayload): Promise<{ id: string }> {
  const res = await fetch(`${baseUrl()}/api/applications`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ondorse createApplication failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function createPerson(
  applicationId: string,
  payload: PersonPayload
): Promise<{ id: string; [key: string]: unknown }> {
  const res = await fetch(`${baseUrl()}/api/applications/${applicationId}/persons`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ondorse createPerson failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ id: string }> {
  const { base, key } = getConfig()
  const formData = new FormData()
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType })
  formData.append('file', blob, fileName)

  const res = await fetch(`${base}/api/files`, {
    method: 'POST',
    headers: { Authorization: key },
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ondorse uploadFile failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function createDocument(
  payload: DocumentPayload
): Promise<{ id: string; [key: string]: unknown }> {
  const res = await fetch(`${baseUrl()}/api/documents`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ondorse createDocument failed: ${res.status} ${text}`)
  }

  return res.json()
}
