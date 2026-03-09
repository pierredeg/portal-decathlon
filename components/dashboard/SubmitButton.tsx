'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePortal } from '@/lib/store'

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
      // 1. Create application
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

      const { applicationId } = await appRes.json()

      // 2. Submit documents
      const docsData = state.sections.documents.data
      if (docsData) {
        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId, documentsData: null }), // files uploaded separately
        })
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
