'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePortal } from '@/lib/store'
import { isPersonDocument } from '@/types/portal'

export default function SubmitButton() {
  const { state } = usePortal()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredSections = ['businessInfo', 'accountOwner', 'personalInfo', 'relations', 'documents'] as const
  const allComplete = requiredSections.every((k) => state.sections[k].completed)

  async function handleSubmit() {
    if (!allComplete || loading) return
    setLoading(true)
    setError(null)

    try {
      // Reuse existing applicationId from BusinessInfoForm, or create if missing
      let applicationId = state.applicationId

      if (!applicationId) {
        const businessData = state.sections.businessInfo.data!
        const appRes = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business: {
              organization_name: businessData.company_name,
              country: businessData.country,
              legal_type: businessData.legal_form,
              local_number: businessData.registration_number,
              address: { single_line: businessData.address },
            },
            external_reference: `decathlon-${Date.now()}`,
          }),
        })

        if (!appRes.ok) {
          const err = await appRes.json()
          throw new Error(err.error || 'Erreur lors de la création du dossier')
        }

        const result = await appRes.json()
        applicationId = result.applicationId
      }

      // Create the account owner (signatory) in Ondorse
      const ownerData = state.sections.accountOwner.data
      const personalData = state.sections.personalInfo.data
      if (ownerData) {
        const personPayload: Record<string, unknown> = {
          given_names: ownerData.given_names,
          last_name: ownerData.last_name,
          email: ownerData.email,
          roles: ['ACCOUNT_OWNER'],
        }
        if (personalData) {
          if (personalData.birth_date_year && personalData.birth_date_month && personalData.birth_date_day) {
            personPayload.birth_date = `${personalData.birth_date_year}-${String(personalData.birth_date_month).padStart(2, '0')}-${String(personalData.birth_date_day).padStart(2, '0')}`
          }
          if (personalData.nationality) personPayload.nationalities = [personalData.nationality]
          if (personalData.address_single_line) personPayload.address_single_line = personalData.address_single_line
        }
        console.log('[Submit] Creating ACCOUNT_OWNER person:', personPayload)
        const personRes = await fetch(`/api/applications/${applicationId}/persons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personPayload),
        })
        if (!personRes.ok) {
          const errText = await personRes.text()
          console.error('[Submit] Failed to create ACCOUNT_OWNER person:', personRes.status, errText)
        } else {
          const personResult = await personRes.json()
          console.log('[Submit] ACCOUNT_OWNER person created:', personResult)
        }
      } else {
        console.warn('[Submit] No accountOwner data found, skipping ACCOUNT_OWNER person creation')
      }

      // Fetch persons from the application to get their Ondorse person_ids
      let ondorsePersons: { id: string; given_names?: string; last_name?: string; roles?: string[] }[] = []
      try {
        const personsRes = await fetch(`/api/applications/${applicationId}/persons`)
        if (personsRes.ok) {
          const personsData = await personsRes.json()
          ondorsePersons = Array.isArray(personsData) ? personsData : (personsData.persons ?? personsData.data ?? [])
          console.log('[Submit] Ondorse persons:', ondorsePersons)
        }
      } catch (e) {
        console.warn('[Submit] Could not fetch persons:', e)
      }

      // Link uploaded documents to the application
      const docsData = state.sections.documents.data
      if (docsData) {
        const documents: {
          name: string
          expectedDocumentId: string
          files: { fileId: string; side: 'front' | 'back' }[]
          applicationId?: string
          personId?: string
        }[] = []

        // Company documents — prefer companyFiles array, fallback to kbis only if no companyFiles
        const companyFiles = docsData.companyFiles?.length
          ? docsData.companyFiles
          : (docsData.kbis.fileId ? [docsData.kbis] : [])
        const expectedDocs = docsData.expectedDocuments ?? []
        for (const cf of companyFiles) {
          if (!cf.fileId) continue
          const expectedDoc = expectedDocs.find((d) => d.id === cf.expectedDocumentId)
          documents.push({
            name: expectedDoc?.name ?? 'Document',
            expectedDocumentId: cf.expectedDocumentId || '',
            files: [{ fileId: cf.fileId, side: 'front' }],
            applicationId: applicationId!,
          })
        }

        // Person documents — match portal person to Ondorse person by name
        for (const pd of docsData.personDocuments) {
          const files: { fileId: string; side: 'front' | 'back' }[] = []
          if (pd.front.fileId) files.push({ fileId: pd.front.fileId, side: 'front' })
          if (pd.back.fileId) files.push({ fileId: pd.back.fileId, side: 'back' })
          if (files.length === 0) continue

          // Find matching Ondorse person by name
          const ondorsePerson = ondorsePersons.find((op) => {
            const opName = `${op.given_names ?? ''} ${op.last_name ?? ''}`.trim().toLowerCase()
            return opName === pd.personName.trim().toLowerCase()
          })

          const expectedDoc = expectedDocs.find((d) => d.id === pd.expectedDocumentId)

          if (ondorsePerson) {
            // Person doc → use person_id
            documents.push({
              name: expectedDoc?.name ?? pd.expectedDocumentName ?? 'ID',
              expectedDocumentId: pd.expectedDocumentId || pd.front.expectedDocumentId || '',
              files,
              personId: ondorsePerson.id,
            })
          } else {
            // Fallback: attach to application
            console.warn('[Submit] No Ondorse person found for:', pd.personName)
            documents.push({
              name: expectedDoc?.name ?? pd.expectedDocumentName ?? 'ID',
              expectedDocumentId: pd.expectedDocumentId || pd.front.expectedDocumentId || '',
              files,
              applicationId: applicationId!,
            })
          }
        }

        if (documents.length > 0) {
          const docRes = await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documents }),
          })
          if (!docRes.ok) {
            const errText = await docRes.text()
            console.error('[Submit] Documents linking failed:', errText)
            throw new Error('Erreur lors de l\'envoi des documents. Réessayez ou contactez le support.')
          }
          const docResult = await docRes.json()
          console.log('[Submit] Documents linked:', docResult)
        }
      }

      // Send custom fields if any
      const customFieldsData = state.sections.customFields.data
      if (customFieldsData && Object.keys(customFieldsData).length > 0) {
        const cfRes = await fetch(`/api/applications/${applicationId}/custom-fields`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ custom_fields: customFieldsData }),
        })
        if (!cfRes.ok) {
          console.error('[Submit] Custom fields update failed:', await cfRes.text())
        } else {
          console.log('[Submit] Custom fields saved')
        }
      }

      // Submit the draft application (makes it visible in Ondorse)
      const submitRes = await fetch(`/api/applications/${applicationId}/submit`, {
        method: 'PUT',
      })
      if (!submitRes.ok) {
        const errText = await submitRes.text()
        console.error('[Submit] Application submit failed:', errText)
        throw new Error('Erreur lors de la soumission du dossier. Réessayez ou contactez le support.')
      }

      router.push(`/confirmation?ref=${applicationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {error && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/5 border border-danger/20 rounded-lg px-4 py-2.5">
          <i className="ri-error-warning-line" />
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!allComplete || loading}
        className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-[100px] font-bold text-base transition-all ${
          allComplete && !loading
            ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md'
            : 'bg-grey-200 text-grey-600 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <i className="ri-loader-4-line animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <i className="ri-send-plane-line" />
            Soumettre mon dossier
          </>
        )}
      </button>
      {!allComplete && (
        <p className="text-grey-600 text-sm text-center">
          Complétez toutes les sections requises pour soumettre votre dossier.
        </p>
      )}
    </div>
  )
}
