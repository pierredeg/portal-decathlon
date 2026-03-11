'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { BusinessInfoData } from '@/types/portal'
import CompanySearch, { type CompanyDetails } from '@/components/forms/CompanySearch'

const schema = z.object({
  company_name: z.string().min(1, 'Champ requis'),
  country: z.string().min(1, 'Champ requis'),
  legal_form: z.string().min(1, 'Champ requis'),
  registration_number: z.string().min(1, 'Champ requis'),
  address: z.string().min(1, 'Champ requis'),
})

const LEGAL_FORMS = ['SAS', 'SARL', 'SA', 'SNC', 'EURL', 'SCI', 'GmbH', 'Ltd', 'Inc.', 'Autre']
const COUNTRIES = [
  { code: 'FRA', label: 'France' },
  { code: 'DEU', label: 'Allemagne' },
  { code: 'ESP', label: 'Espagne' },
  { code: 'ITA', label: 'Italie' },
  { code: 'BEL', label: 'Belgique' },
  { code: 'CHE', label: 'Suisse' },
  { code: 'GBR', label: 'Royaume-Uni' },
  { code: 'USA', label: 'États-Unis' },
  { code: 'OTHER', label: 'Autre' },
]

function buildAddress(addr: CompanyDetails['official_address']): string {
  const parts = [
    addr.building_number,
    addr.street,
    addr.postcode,
    addr.town,
  ].filter(Boolean)
  return parts.join(' ')
}

export default function BusinessInfoForm() {
  const { state, updateSection, setApplicationId, setEnriched } = usePortal()
  const router = useRouter()
  const existing = state.sections.businessInfo.data
  const [enriching, setEnriching] = useState(false)
  const [enrichStatus, setEnrichStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const { register, handleSubmit, setValue, control, watch, formState: { errors } } = useForm<BusinessInfoData>({
    resolver: zodResolver(schema),
    defaultValues: existing ?? undefined,
  })
  const watched = watch()

  const selectedCountry = useWatch({ control, name: 'country', defaultValue: 'FRA' })

  function handleCompanySelect(company: CompanyDetails) {
    setValue('company_name', company.organization_name, { shouldValidate: true })
    setValue('registration_number', company.registration_number, { shouldValidate: true })
    setValue('legal_form', company.legal_type || company.legal_type_raw || '', { shouldValidate: true })
    setValue('country', company.country_code, { shouldValidate: true })
    if (company.official_address) {
      setValue('address', buildAddress(company.official_address), { shouldValidate: true })
    }
  }

  async function onSubmit(data: BusinessInfoData) {
    updateSection('businessInfo', data)

    // Always create a fresh draft case for the current company, then enrich
    if (data.registration_number) {
      setEnriching(true)
      try {
        console.log('[BusinessInfo] Creating draft application...')
        const appRes = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business: {
              organization_name: data.company_name,
              country: data.country,
              legal_type: data.legal_form,
              local_number: data.registration_number,
              address: { single_line: data.address },
            },
            external_reference: `decathlon-${Date.now()}`,
          }),
        })
        console.log('[BusinessInfo] App response status:', appRes.status)

        if (!appRes.ok) {
          const errText = await appRes.text()
          console.error('[BusinessInfo] App creation failed:', errText)
          throw new Error(errText)
        }

        const result = await appRes.json()
        const applicationId = result.applicationId as string
        console.log('[BusinessInfo] Draft created:', applicationId)
        setApplicationId(applicationId)

        console.log('[BusinessInfo] Triggering enrichment...')
        const enrichRes = await fetch('/api/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId }),
        })
        console.log('[BusinessInfo] Enrich response status:', enrichRes.status)

        if (enrichRes.ok) {
          const enrichData = await enrichRes.json()
          console.log('[BusinessInfo] Enrichment result:', enrichData.persons?.length, 'persons')
          if (enrichData.persons?.length > 0) {
            setEnriched(enrichData.persons)
            setEnrichStatus('success')
          }
        } else {
          const errText = await enrichRes.text()
          console.error('[BusinessInfo] Enrich failed:', errText)
        }
      } catch (err) {
        console.error('[BusinessInfo] Error:', err)
        setEnrichStatus('error')
      } finally {
        setEnriching(false)
      }
    }

    // Delay to let React flush state updates + localStorage persist
    await new Promise((r) => setTimeout(r, 200))
    router.push('/dashboard')
  }

  const inputClass = (name: keyof BusinessInfoData, hasError: boolean) => {
    const val = watched[name]
    const isValid = !hasError && val !== undefined && val !== ''
    return `h-11 rounded-[8px] border-[1.5px] px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none transition-all duration-[120ms] ${
      hasError
        ? 'border-danger focus:shadow-[0_0_0_3px_rgba(204,25,0,0.15)]'
        : isValid
          ? 'border-success focus:border-success focus:shadow-[0_0_0_3px_rgba(0,138,62,0.15)]'
          : 'border-grey-300 hover:border-grey-500 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(54,67,186,0.15)]'
    }`
  }
  const selectClass = (name: keyof BusinessInfoData, hasError: boolean) => {
    const val = watched[name]
    const isValid = !hasError && val !== undefined && val !== ''
    return `h-11 rounded-[8px] border-[1.5px] px-3.5 text-sm text-grey-900 bg-white outline-none transition-all duration-[120ms] ${
      hasError
        ? 'border-danger focus:shadow-[0_0_0_3px_rgba(204,25,0,0.15)]'
        : isValid
          ? 'border-success focus:border-success focus:shadow-[0_0_0_3px_rgba(0,138,62,0.15)]'
          : 'border-grey-300 hover:border-grey-500 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(54,67,186,0.15)]'
    }`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Company autocomplete search */}
      <CompanySearch
        country={selectedCountry || 'FRA'}
        onSelect={handleCompanySelect}
      />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-grey-200" />
        <span className="text-grey-600 text-xs">ou remplissez manuellement</span>
        <div className="flex-1 h-px bg-grey-200" />
      </div>

      {/* Company name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Nom de l&apos;entreprise <span className="text-danger">*</span>
        </label>
        <input
          {...register('company_name')}
          placeholder="Ex : Ma Société SAS"
          className={inputClass('company_name', !!errors.company_name)}
        />
        {errors.company_name && <p className="text-danger text-xs">{errors.company_name.message}</p>}
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Pays d&apos;incorporation <span className="text-danger">*</span>
        </label>
        <select
          {...register('country')}
          className={selectClass('country', !!errors.country)}
        >
          <option value="">Sélectionner un pays</option>
          {COUNTRIES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        {errors.country && <p className="text-danger text-xs">{errors.country.message}</p>}
      </div>

      {/* Legal form */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Forme juridique <span className="text-danger">*</span>
        </label>
        <input
          {...register('legal_form')}
          placeholder="Ex : SAS, SARL, SA..."
          list="legal-forms-list"
          className={inputClass('legal_form', !!errors.legal_form)}
        />
        <datalist id="legal-forms-list">
          {LEGAL_FORMS.map((f) => <option key={f} value={f} />)}
        </datalist>
        {errors.legal_form && <p className="text-danger text-xs">{errors.legal_form.message}</p>}
      </div>

      {/* Registration number */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Numéro d&apos;enregistrement (SIREN/SIRET) <span className="text-danger">*</span>
        </label>
        <input
          {...register('registration_number')}
          placeholder="Ex : 123 456 789"
          className={inputClass('registration_number', !!errors.registration_number)}
        />
        {errors.registration_number && <p className="text-danger text-xs">{errors.registration_number.message}</p>}
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Adresse du siège social <span className="text-danger">*</span>
        </label>
        <input
          {...register('address')}
          placeholder="Ex : 4 Boulevard de Mons, 59650 Villeneuve-d'Ascq"
          className={inputClass('address', !!errors.address)}
        />
        {errors.address && <p className="text-danger text-xs">{errors.address.message}</p>}
      </div>

      {/* Enrichment status */}
      {enriching && (
        <div className="flex items-center gap-2 text-brand-500 text-sm bg-brand-50 rounded-[8px] px-4 py-2.5">
          <i className="ri-loader-4-line animate-spin" />
          Récupération des données officielles...
        </div>
      )}
      {enrichStatus === 'success' && (
        <div className="flex items-center gap-2 text-success text-sm bg-success/5 border border-success/20 rounded-[8px] px-4 py-2.5">
          <i className="ri-checkbox-circle-line" />
          Relations d&apos;entreprise pré-remplies depuis les registres officiels
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-grey-600 text-sm font-medium hover:text-grey-900 transition-colors"
        >
          <i className="ri-arrow-left-line" />
          Retour
        </button>
        <button
          type="submit"
          disabled={enriching}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[100px] bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm transition-colors"
        >
          {enriching ? (
            <>
              <i className="ri-loader-4-line animate-spin" />
              En cours...
            </>
          ) : (
            <>
              Sauvegarder
              <i className="ri-check-line" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
