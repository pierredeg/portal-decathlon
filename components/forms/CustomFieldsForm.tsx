'use client'

import { useState, useEffect } from 'react'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { CustomFieldConfig, CustomFieldsData, CustomFieldValue } from '@/types/portal'

// Validation: checks if a field value is valid (non-empty, correct format)
function isFieldValid(field: CustomFieldConfig, value: CustomFieldValue | undefined): boolean {
  if (value === undefined || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'boolean') return true // boolean is always valid once set

  switch (field.field_type) {
    case 'number':
      return typeof value === 'number' && !isNaN(value)
    case 'date':
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    default:
      return typeof value === 'string' && value.trim().length > 0
  }
}

export default function CustomFieldsForm() {
  const { state, updateSection } = usePortal()
  const router = useRouter()

  const existing = state.sections.customFields.data

  const [fields, setFields] = useState<CustomFieldConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState<CustomFieldsData>(existing ?? {})
  const [saving, setSaving] = useState(false)
  // Track which fields have been touched (blurred or changed)
  const [touched, setTouched] = useState<Set<string>>(new Set(existing ? Object.keys(existing) : []))

  useEffect(() => {
    fetch('/api/custom-fields')
      .then((res) => res.json())
      .then((data) => {
        if (data.customFields?.length > 0) {
          setFields(data.customFields)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function setValue(slug: string, value: CustomFieldValue) {
    setValues((prev) => ({ ...prev, [slug]: value }))
    setTouched((prev) => new Set(prev).add(slug))
  }

  function markTouched(slug: string) {
    setTouched((prev) => new Set(prev).add(slug))
  }

  function handleSave() {
    setSaving(true)
    updateSection('customFields', values)
    router.push('/dashboard')
  }

  // Check required fields are filled
  const requiredMet = fields
    .filter((f) => f.is_required)
    .every((f) => isFieldValid(f, values[f.slug]))

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-brand-500 text-sm py-8 justify-center">
        <i className="ri-loader-4-line animate-spin" />
        Chargement des champs...
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-grey-600 text-sm">Aucune information additionnelle requise.</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mt-4 inline-flex items-center gap-2 text-brand-500 text-sm font-medium hover:text-brand-600 transition-colors"
        >
          <i className="ri-arrow-left-line" />
          Retour au tableau de bord
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {fields.map((field) => {
          const val = values[field.slug]
          const isTouched = touched.has(field.slug)
          const valid = isTouched && isFieldValid(field, val)

          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="text-sm font-medium text-grey-900">
                {field.name}
                {field.is_required && <span className="text-danger ml-0.5">*</span>}
              </label>
              {field.description && (
                <p className="text-grey-600 text-xs">{field.description}</p>
              )}
              {renderField(field, val, (v) => setValue(field.slug, v), valid, () => markTouched(field.slug))}
            </div>
          )
        })}
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
          type="button"
          onClick={handleSave}
          disabled={!requiredMet || saving}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-[100px] font-bold text-sm transition-colors ${
            requiredMet && !saving
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'bg-grey-200 text-grey-600 cursor-not-allowed'
          }`}
        >
          Sauvegarder
          <i className="ri-check-line" />
        </button>
      </div>
    </div>
  )
}

function MultipleChoiceDropdown({
  field,
  value,
  onChange,
  valid,
}: {
  field: CustomFieldConfig
  value: CustomFieldValue | undefined
  onChange: (v: string[]) => void
  valid: boolean
}) {
  const selected = Array.isArray(value) ? value : []
  const options = field.options ?? []

  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-[8px] border p-3.5 transition-colors duration-[120ms] ${
        valid
          ? 'border-success bg-success/[0.03]'
          : 'border-grey-200 bg-white'
      }`}
    >
      {options.map((opt) => {
        const checked = selected.includes(opt)
        return (
          <label key={opt} className="group inline-flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt)}
              className="sr-only"
            />
            {/* Custom checkbox — Decathlon design system */}
            <span
              className={`w-5 h-5 flex-shrink-0 rounded-[4px] border-2 flex items-center justify-center transition-all duration-[120ms] ${
                checked
                  ? 'bg-brand-500 border-brand-500'
                  : 'bg-white border-grey-400 group-hover:border-brand-400'
              }`}
            >
              {checked && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                  <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="text-sm text-grey-900">{opt}</span>
          </label>
        )
      })}
    </div>
  )
}

function renderField(
  field: CustomFieldConfig,
  value: CustomFieldValue | undefined,
  onChange: (v: CustomFieldValue) => void,
  valid: boolean,
  onBlur: () => void,
) {
  // DS tokens: default border grey-200, focus brand-500, valid success
  const baseClasses = 'w-full rounded-[8px] border-[1.5px] bg-white px-3.5 py-2.5 text-sm text-grey-900 outline-none transition-all duration-[120ms]'
  const stateClasses = valid
    ? 'border-success focus:border-success focus:shadow-[0_0_0_3px_rgba(0,138,62,0.15)]'
    : 'border-grey-300 hover:border-grey-500 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(54,67,186,0.15)]'
  const inputClasses = `${baseClasses} ${stateClasses}`

  switch (field.field_type) {
    case 'boolean': {
      const isChecked = !!value
      return (
        <label className="group inline-flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`w-5 h-5 flex-shrink-0 rounded-[4px] border-2 flex items-center justify-center transition-all duration-[120ms] ${
              isChecked
                ? 'bg-brand-500 border-brand-500'
                : 'bg-white border-grey-400 group-hover:border-brand-400'
            }`}
          >
            {isChecked && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className="text-sm text-grey-900">{isChecked ? 'Oui' : 'Non'}</span>
        </label>
      )
    }

    case 'number':
      return (
        <input
          id={field.id}
          type="number"
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          onBlur={onBlur}
          className={inputClasses}
        />
      )

    case 'date':
      return (
        <input
          id={field.id}
          type="date"
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={inputClasses}
        />
      )

    case 'select':
    case 'dropdown':
      return (
        <select
          id={field.id}
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={inputClasses}
        >
          <option value="">Sélectionner...</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )

    case 'multiple_choice_dropdown':
      return (
        <MultipleChoiceDropdown
          field={field}
          value={value}
          onChange={onChange}
          valid={valid}
        />
      )

    case 'textarea':
      return (
        <textarea
          id={field.id}
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          rows={3}
          className={inputClasses}
        />
      )

    default: // string, text, and anything else
      return (
        <input
          id={field.id}
          type="text"
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={inputClasses}
        />
      )
  }
}
