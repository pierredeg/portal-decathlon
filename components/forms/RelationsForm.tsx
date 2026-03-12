'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { RelationPerson, PersonRole } from '@/types/portal'

const personSchema = z.object({
  given_names: z.string().min(1, 'Champ requis'),
  last_name: z.string().min(1, 'Champ requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  roles: z.array(z.string()).min(1, 'Au moins un rôle requis'),
  direct_ownership_percentage: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
})

type PersonForm = z.infer<typeof personSchema>

const ROLE_OPTIONS: { value: PersonRole; label: string }[] = [
  { value: 'DIRECTOR', label: 'Dirigeant' },
  { value: 'UBO', label: 'Bénéficiaire effectif (UBO)' },
  { value: 'SHAREHOLDER', label: 'Actionnaire' },
  { value: 'ACCOUNT_OWNER', label: 'Titulaire du compte' },
]

function PersonCard({ person, onEdit, onRemove }: { person: RelationPerson; onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="bg-grey-50 rounded-[12px] border border-grey-200 p-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
          <i className="ri-user-line text-brand-500 text-base" />
        </div>
        <div>
          <p className="font-medium text-grey-900 text-sm">{person.given_names} {person.last_name}</p>
          {person.email && <p className="text-grey-600 text-xs">{person.email}</p>}
          <div className="flex flex-wrap gap-1 mt-1">
            {person.roles.map((r) => (
              <span key={r} className="text-xs bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full">
                {ROLE_OPTIONS.find(o => o.value === r)?.label ?? r}
              </span>
            ))}
          </div>
          {person.direct_ownership_percentage != null && (
            <p className="text-grey-600 text-xs mt-1">Participation : {person.direct_ownership_percentage}%</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="text-grey-600 hover:text-brand-500 transition-colors"
          aria-label="Modifier"
        >
          <i className="ri-pencil-line" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-grey-600 hover:text-danger transition-colors"
          aria-label="Supprimer"
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>
    </div>
  )
}

function PersonModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: RelationPerson
  onSave: (p: RelationPerson) => void
  onClose: () => void
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(personSchema),
    defaultValues: {
      given_names: initial?.given_names ?? '',
      last_name: initial?.last_name ?? '',
      email: initial?.email ?? '',
      roles: initial?.roles ?? [],
      direct_ownership_percentage: initial?.direct_ownership_percentage != null
        ? String(initial.direct_ownership_percentage)
        : '',
    },
  })

  const selectedRoles = watch('roles') as string[]

  function toggleRole(role: PersonRole) {
    const current = selectedRoles ?? []
    if (current.includes(role)) {
      setValue('roles', current.filter((r) => r !== role))
    } else {
      setValue('roles', [...current, role])
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(data: any) {
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      given_names: data.given_names,
      last_name: data.last_name,
      email: data.email || undefined,
      roles: data.roles as PersonRole[],
      direct_ownership_percentage: data.direct_ownership_percentage,
    })
    onClose()
  }

  const inputClass = (hasError: boolean) =>
    `h-11 rounded-[8px] border px-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
      hasError ? 'border-danger' : 'border-grey-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[12px] w-full max-w-md p-6 flex flex-col gap-5" style={{ boxShadow: '0 20px 25px rgba(0,16,24,.10)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-condensed font-bold text-grey-900 text-lg">{initial ? 'Modifier la personne' : 'Ajouter une personne'}</h3>
          <button onClick={onClose} className="text-grey-600 hover:text-grey-900">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-grey-900">Prénom(s) *</label>
              <input {...register('given_names')} placeholder="Jean" className={inputClass(!!errors.given_names)} style={{ borderWidth: '1.5px' }} />
              {errors.given_names && <p className="text-danger text-xs">{errors.given_names.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-grey-900">Nom *</label>
              <input {...register('last_name')} placeholder="Dupont" className={inputClass(!!errors.last_name)} style={{ borderWidth: '1.5px' }} />
              {errors.last_name && <p className="text-danger text-xs">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grey-900">Email</label>
            <input {...register('email')} type="email" placeholder="jean@entreprise.com" className={inputClass(!!errors.email)} style={{ borderWidth: '1.5px' }} />
            {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grey-900">Rôle(s) *</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleRole(value)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    selectedRoles?.includes(value)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-grey-600 border-grey-300 hover:border-brand-500 hover:text-brand-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.roles && <p className="text-danger text-xs">{errors.roles.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grey-900">% de participation (si applicable)</label>
            <input
              {...register('direct_ownership_percentage')}
              type="number"
              min={0}
              max={100}
              placeholder="Ex : 25"
              className={inputClass(false)}
              style={{ borderWidth: '1.5px' }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="text-grey-600 text-sm font-medium hover:text-grey-900">
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-[100px] bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors"
            >
              {initial ? 'Enregistrer' : 'Ajouter'}
              <i className={initial ? 'ri-check-line' : 'ri-user-add-line'} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function buildInitialPersons(state: ReturnType<typeof usePortal>['state']): RelationPerson[] {
  const existing = state.sections.relations.data ?? []
  const owner = state.sections.accountOwner.data
  if (!owner) return existing

  const alreadyPresent = existing.some(
    (p) => p.given_names.toLowerCase() === owner.given_names.toLowerCase() &&
           p.last_name.toLowerCase() === owner.last_name.toLowerCase()
  )
  if (alreadyPresent) return existing

  const ownerPerson: RelationPerson = {
    id: 'account-owner',
    given_names: owner.given_names,
    last_name: owner.last_name,
    email: owner.email,
    roles: ['ACCOUNT_OWNER'],
  }
  return [ownerPerson, ...existing]
}

export default function RelationsForm() {
  const { state, updateSection } = usePortal()
  const router = useRouter()
  const [persons, setPersons] = useState<RelationPerson[]>(() => buildInitialPersons(state))
  const [editingPerson, setEditingPerson] = useState<RelationPerson | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  function savePerson(p: RelationPerson) {
    setPersons((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = p
        return next
      }
      return [...prev, p]
    })
  }

  function removePerson(id: string) {
    setPersons((prev) => prev.filter((p) => p.id !== id))
  }

  function handleSave() {
    updateSection('relations', persons)
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col gap-5">
      {persons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 bg-grey-50 rounded-[12px] border border-dashed border-grey-300">
          <div className="w-12 h-12 rounded-full bg-grey-100 flex items-center justify-center">
            <i className="ri-team-line text-grey-600 text-2xl" />
          </div>
          <div className="text-center">
            <p className="text-grey-900 font-medium text-sm">Aucune personne ajoutée</p>
            <p className="text-grey-600 text-xs mt-0.5">Ajoutez les dirigeants, actionnaires et bénéficiaires effectifs.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {persons.map((p) => (
            <PersonCard key={p.id} person={p} onEdit={() => setEditingPerson(p)} onRemove={() => removePerson(p.id)} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="inline-flex items-center gap-2 text-brand-500 text-sm font-medium border border-brand-500/30 hover:border-brand-500 rounded-[8px] px-4 py-2.5 transition-colors"
      >
        <i className="ri-user-add-line" />
        Ajouter une personne
      </button>

      {showAddModal && (
        <PersonModal onSave={savePerson} onClose={() => setShowAddModal(false)} />
      )}
      {editingPerson && (
        <PersonModal initial={editingPerson} onSave={savePerson} onClose={() => setEditingPerson(null)} />
      )}

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
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[100px] bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors"
        >
          Sauvegarder
          <i className="ri-check-line" />
        </button>
      </div>
    </div>
  )
}
