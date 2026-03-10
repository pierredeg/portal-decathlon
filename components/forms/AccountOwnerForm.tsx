'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { AccountOwnerData, PersonalInfoData } from '@/types/portal'

const schema = z.object({
  given_names: z.string().min(1, 'Champ requis'),
  last_name: z.string().min(1, 'Champ requis'),
  email: z.string().email('Email invalide'),
  role_in_company: z.string().min(1, 'Champ requis'),
  birth_date_day: z.coerce.number().min(1).max(31),
  birth_date_month: z.coerce.number().min(1).max(12),
  birth_date_year: z.coerce.number().min(1900).max(new Date().getFullYear() - 18, {
    message: 'Vous devez avoir au moins 18 ans',
  }),
  nationality: z.string().min(1, 'Champ requis'),
  address_single_line: z.string().min(1, 'Champ requis'),
  phone_number: z.string().min(1, 'Champ requis'),
})

type FormData = z.infer<typeof schema>

const ROLES = ['Dirigeant / CEO', 'Directeur financier', 'Responsable des achats', 'Juriste', 'Autre']

const NATIONALITIES = [
  { code: 'FRA', label: 'Française' },
  { code: 'DEU', label: 'Allemande' },
  { code: 'ESP', label: 'Espagnole' },
  { code: 'ITA', label: 'Italienne' },
  { code: 'BEL', label: 'Belge' },
  { code: 'CHE', label: 'Suisse' },
  { code: 'GBR', label: 'Britannique' },
  { code: 'USA', label: 'Américaine' },
  { code: 'OTHER', label: 'Autre' },
]

export default function AccountOwnerForm() {
  const { state, updateSection } = usePortal()
  const router = useRouter()
  const ownerData = state.sections.accountOwner.data
  const personalData = state.sections.personalInfo.data

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      given_names: ownerData?.given_names ?? '',
      last_name: ownerData?.last_name ?? '',
      email: ownerData?.email ?? '',
      role_in_company: ownerData?.role_in_company ?? '',
      birth_date_day: personalData?.birth_date_day ?? undefined,
      birth_date_month: personalData?.birth_date_month ?? undefined,
      birth_date_year: personalData?.birth_date_year ?? undefined,
      nationality: personalData?.nationality ?? '',
      address_single_line: personalData?.address_single_line ?? '',
      phone_number: personalData?.phone_number ?? '',
    },
  })

  function onSubmit(data: FormData) {
    const accountOwner: AccountOwnerData = {
      given_names: data.given_names,
      last_name: data.last_name,
      email: data.email,
      role_in_company: data.role_in_company,
    }
    const personalInfo: PersonalInfoData = {
      birth_date_day: data.birth_date_day,
      birth_date_month: data.birth_date_month,
      birth_date_year: data.birth_date_year,
      nationality: data.nationality,
      address_single_line: data.address_single_line,
      phone_number: data.phone_number,
    }
    updateSection('accountOwner', accountOwner)
    updateSection('personalInfo', personalInfo)
    router.push('/dashboard')
  }

  const inputClass = (hasError: boolean) =>
    `h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
      hasError ? 'border-danger' : 'border-grey-300'
    }`

  const selectClass = (hasError: boolean) =>
    `h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 bg-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
      hasError ? 'border-danger' : 'border-grey-300'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-grey-900">
            Prénom(s) <span className="text-danger">*</span>
          </label>
          <input
            {...register('given_names')}
            placeholder="Jean"
            className={inputClass(!!errors.given_names)}
            style={{ borderWidth: '1.5px' }}
          />
          {errors.given_names && <p className="text-danger text-xs">{errors.given_names.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-grey-900">
            Nom <span className="text-danger">*</span>
          </label>
          <input
            {...register('last_name')}
            placeholder="Dupont"
            className={inputClass(!!errors.last_name)}
            style={{ borderWidth: '1.5px' }}
          />
          {errors.last_name && <p className="text-danger text-xs">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Email professionnel <span className="text-danger">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="jean.dupont@entreprise.com"
          className={inputClass(!!errors.email)}
          style={{ borderWidth: '1.5px' }}
        />
        {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Rôle dans l&apos;entreprise <span className="text-danger">*</span>
        </label>
        <select
          {...register('role_in_company')}
          className={selectClass(!!errors.role_in_company)}
          style={{ borderWidth: '1.5px' }}
        >
          <option value="">Sélectionner un rôle</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {errors.role_in_company && <p className="text-danger text-xs">{errors.role_in_company.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Date de naissance <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            {...register('birth_date_day')}
            type="number"
            placeholder="JJ"
            min={1}
            max={31}
            className={inputClass(!!errors.birth_date_day)}
            style={{ borderWidth: '1.5px' }}
          />
          <input
            {...register('birth_date_month')}
            type="number"
            placeholder="MM"
            min={1}
            max={12}
            className={inputClass(!!errors.birth_date_month)}
            style={{ borderWidth: '1.5px' }}
          />
          <input
            {...register('birth_date_year')}
            type="number"
            placeholder="AAAA"
            min={1900}
            max={new Date().getFullYear()}
            className={inputClass(!!errors.birth_date_year)}
            style={{ borderWidth: '1.5px' }}
          />
        </div>
        {(errors.birth_date_day || errors.birth_date_month || errors.birth_date_year) && (
          <p className="text-danger text-xs">Date de naissance invalide</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Nationalité <span className="text-danger">*</span>
        </label>
        <select
          {...register('nationality')}
          className={selectClass(!!errors.nationality)}
          style={{ borderWidth: '1.5px' }}
        >
          <option value="">Sélectionner une nationalité</option>
          {NATIONALITIES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        {errors.nationality && <p className="text-danger text-xs">{errors.nationality.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Adresse personnelle <span className="text-danger">*</span>
        </label>
        <input
          {...register('address_single_line')}
          placeholder="Ex : 12 rue de la Paix, 75001 Paris"
          className={inputClass(!!errors.address_single_line)}
          style={{ borderWidth: '1.5px' }}
        />
        {errors.address_single_line && <p className="text-danger text-xs">{errors.address_single_line.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Numéro de téléphone <span className="text-danger">*</span>
        </label>
        <input
          {...register('phone_number')}
          type="tel"
          placeholder="+33 6 12 34 56 78"
          className={inputClass(!!errors.phone_number)}
          style={{ borderWidth: '1.5px' }}
        />
        {errors.phone_number && <p className="text-danger text-xs">{errors.phone_number.message}</p>}
      </div>

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
