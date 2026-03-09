'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { BusinessInfoData } from '@/types/portal'

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

export default function BusinessInfoForm() {
  const { state, updateSection } = usePortal()
  const router = useRouter()
  const existing = state.sections.businessInfo.data

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessInfoData>({
    resolver: zodResolver(schema),
    defaultValues: existing ?? undefined,
  })

  function onSubmit(data: BusinessInfoData) {
    updateSection('businessInfo', data)
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Company name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Nom de l&apos;entreprise <span className="text-danger">*</span>
        </label>
        <input
          {...register('company_name')}
          placeholder="Ex : Ma Société SAS"
          className={`h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
            errors.company_name ? 'border-danger' : 'border-grey-300'
          }`}
          style={{ borderWidth: '1.5px' }}
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
          className={`h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 bg-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
            errors.country ? 'border-danger' : 'border-grey-300'
          }`}
          style={{ borderWidth: '1.5px' }}
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
        <select
          {...register('legal_form')}
          className={`h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 bg-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
            errors.legal_form ? 'border-danger' : 'border-grey-300'
          }`}
          style={{ borderWidth: '1.5px' }}
        >
          <option value="">Sélectionner une forme juridique</option>
          {LEGAL_FORMS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
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
          className={`h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
            errors.registration_number ? 'border-danger' : 'border-grey-300'
          }`}
          style={{ borderWidth: '1.5px' }}
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
          className={`h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
            errors.address ? 'border-danger' : 'border-grey-300'
          }`}
          style={{ borderWidth: '1.5px' }}
        />
        {errors.address && <p className="text-danger text-xs">{errors.address.message}</p>}
      </div>

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
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[100px] bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors"
        >
          Sauvegarder
          <i className="ri-check-line" />
        </button>
      </div>
    </form>
  )
}
