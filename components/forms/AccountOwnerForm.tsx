'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { AccountOwnerData } from '@/types/portal'

const schema = z.object({
  given_names: z.string().min(1, 'Champ requis'),
  last_name: z.string().min(1, 'Champ requis'),
  email: z.string().email('Email invalide'),
  role_in_company: z.string().min(1, 'Champ requis'),
})

const ROLES = ['Dirigeant / CEO', 'Directeur financier', 'Responsable des achats', 'Juriste', 'Autre']

export default function AccountOwnerForm() {
  const { state, updateSection } = usePortal()
  const router = useRouter()
  const existing = state.sections.accountOwner.data

  const { register, handleSubmit, formState: { errors } } = useForm<AccountOwnerData>({
    resolver: zodResolver(schema),
    defaultValues: existing ?? undefined,
  })

  function onSubmit(data: AccountOwnerData) {
    updateSection('accountOwner', data)
    router.push('/dashboard')
  }

  const inputClass = (hasError: boolean) =>
    `h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
      hasError ? 'border-danger' : 'border-grey-300'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* First name */}
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

        {/* Last name */}
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

      {/* Email */}
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

      {/* Role */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-grey-900">
          Rôle dans l&apos;entreprise <span className="text-danger">*</span>
        </label>
        <select
          {...register('role_in_company')}
          className={`h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 bg-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
            errors.role_in_company ? 'border-danger' : 'border-grey-300'
          }`}
          style={{ borderWidth: '1.5px' }}
        >
          <option value="">Sélectionner un rôle</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {errors.role_in_company && <p className="text-danger text-xs">{errors.role_in_company.message}</p>}
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
