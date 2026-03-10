import { NextRequest, NextResponse } from 'next/server'

function getConfig() {
  const base = process.env.ONDORSE_API_URL
  const key = process.env.ONDORSE_API_KEY
  if (!base || !key) throw new Error('Missing env variables')
  return { base, key }
}

function mapRole(roles: string[]): string[] {
  const mapping: Record<string, string> = {
    dirigeant: 'DIRECTOR',
    directeur: 'DIRECTOR',
    director: 'DIRECTOR',
    president: 'DIRECTOR',
    ubo: 'UBO',
    beneficiaire: 'UBO',
    actionnaire: 'SHAREHOLDER',
    shareholder: 'SHAREHOLDER',
    associe: 'SHAREHOLDER',
  }
  const mapped = roles.map((r) => {
    const lower = r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    for (const [key, val] of Object.entries(mapping)) {
      if (lower.includes(key)) return val
    }
    return 'DIRECTOR'
  })
  return [...new Set(mapped)]
}

export async function POST(req: NextRequest) {
  try {
    const { applicationId } = await req.json()
    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 })
    }

    const { base, key } = getConfig()

    // Step 1: Trigger enrichment
    const enrichRes = await fetch(`${base}/api/applications/${applicationId}/enrich`, {
      method: 'POST',
      headers: { Authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ force_fetch_official_data: true }),
    })
    console.log('[enrich] trigger status:', enrichRes.status)

    // Step 2: Poll for enriched application (enrichment is async)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let app: any = {}
    const MAX_ATTEMPTS = 5
    const DELAY_MS = 2000

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
      console.log(`[enrich] Polling attempt ${attempt}/${MAX_ATTEMPTS}...`)

      const appRes = await fetch(`${base}/api/applications/${applicationId}`, {
        headers: { Authorization: key },
      })

      if (!appRes.ok) {
        const text = await appRes.text()
        return NextResponse.json({ error: `GET application failed: ${text}` }, { status: appRes.status })
      }

      app = await appRes.json()
      const personsCount = (app.persons as unknown[] | undefined)?.length ?? 0
      console.log(`[enrich] Attempt ${attempt}: ${personsCount} persons`)

      if (personsCount > 0) break
    }

    console.log('[enrich] Final persons count:', (app.persons as unknown[] | undefined)?.length ?? 0)
    console.log('[enrich] persons sample:', JSON.stringify((app.persons as unknown[])?.[0] ?? null).slice(0, 400))

    // Step 3: Map persons to RelationPerson format
    const persons = (app.persons ?? []).map((p: Record<string, unknown>) => {
      const roles = Array.isArray(p.roles) ? p.roles as string[] : []
      const given = (p.given_names as string) || (p.first_name as string) || ''
      const last = (p.last_name as string) || (p.surname as string) || ''
      return {
        id: (p.id as string) || crypto.randomUUID(),
        given_names: given,
        last_name: last,
        email: (p.email as string) || undefined,
        roles: mapRole(roles) as ('DIRECTOR' | 'UBO' | 'SHAREHOLDER' | 'ACCOUNT_OWNER')[],
        direct_ownership_percentage: (p.direct_ownership_percentage as number) || undefined,
        fromEnrichment: true,
      }
    })

    return NextResponse.json({ persons, raw: { personsCount: app.persons?.length ?? 0 } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
