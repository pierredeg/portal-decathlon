'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { PersonalInfoData } from '@/types/portal'

const schema = z.object({
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

export default function PersonalInfoForm() {
  const { state, updateSection } = usePortal()
  const router = useRouter()
  const existing = state.sections.personalInfo.data

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: existing ?? undefined,
  })

  const watched = watch()

  function onSubmit(data: FormData & PersonalInfoData) {
    updateSection('personalInfo', data)
    router.push('/dashboard')
  }

  const inputClass = (name: keyof FormData, hasError: boolean) => {
    const val = watched[name]
    const isValid = !hasError && val !== undefined && val !== '' && val !== 0
    return `h-11 rounded-[8px] border-[1.5px] px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none transition-all duration-[120ms] ${
      hasError
        ? 'border-danger focus:shadow-[0_0_0_3px_rgba(204,25,0,0.15)]'
        : isValid
          ? 'border-success focus:border-success focus:shadow-[0_0_0_3px_rgba(0,138,62,0.15)]'
          : 'border-grey-300 hover:border-grey-500 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(54,67,186,0.15)]'
    }`
  }

  const selectClass = (name: keyof FormData, hasError: boolean) => {
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
      {/* Date of birth */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Date de naissance <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <input
              {...register('birth_date_day')}
              type="number"
              placeholder="JJ"
              min={1}
              max={31}
              className={inputClass('birth_date_day', !!errors.birth_date_day)}
            />
          </div>
          <div>
            <input
              {...register('birth_date_month')}
              type="number"
              placeholder="MM"
              min={1}
              max={12}
              className={inputClass('birth_date_month', !!errors.birth_date_month)}
            />
          </div>
          <div>
            <input
              {...register('birth_date_year')}
              type="number"
              placeholder="AAAA"
              min={1900}
              max={new Date().getFullYear()}
              className={inputClass('birth_date_year', !!errors.birth_date_year)}
            />
          </div>
        </div>
        {(errors.birth_date_day || errors.birth_date_month || errors.birth_date_year) && (
          <p className="text-danger text-xs">Date de naissance invalide</p>
        )}
      </div>

      {/* Nationality */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Nationalité <span className="text-danger">*</span>
        </label>
        <select
          {...register('nationality')}
          className={selectClass('nationality', !!errors.nationality)}
        >
          <option value="">Sélectionner une nationalité</option>
          {NATIONALITIES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        {errors.nationality && <p className="text-danger text-xs">{errors.nationality.message}</p>}
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Adresse personnelle <span className="text-danger">*</span>
        </label>
        <input
          {...register('address_single_line')}
          placeholder="Ex : 12 rue de la Paix, 75001 Paris"
          className={inputClass('address_single_line', !!errors.address_single_line)}
        />
        {errors.address_single_line && <p className="text-danger text-xs">{errors.address_single_line.message}</p>}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Numéro de téléphone <span className="text-danger">*</span>
        </label>
        <input
          {...register('phone_number')}
          type="tel"
          placeholder="+33 6 12 34 56 78"
          className={inputClass('phone_number', !!errors.phone_number)}
        />
        {errors.phone_number && <p className="text-danger text-xs">{errors.phone_number.message}</p>}
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
