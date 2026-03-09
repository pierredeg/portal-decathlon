'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { DocumentFile, DocumentsData, PersonDocuments } from '@/types/portal'

const ACCEPTED_TYPES = { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function FileDropzone({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: DocumentFile
  onChange: (f: DocumentFile) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        setError(rejected[0].errors[0]?.message ?? 'Fichier invalide')
        return
      }
      if (accepted[0]) {
        setError(null)
        onChange({ file: accepted[0], fileName: accepted[0].name })
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  })

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-grey-900">{label}</label>
      {hint && <p className="text-grey-600 text-xs">{hint}</p>}

      {value.fileName ? (
        <div className="flex items-center justify-between rounded-[8px] border border-success/40 bg-success/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <i className="ri-file-check-line text-success" />
            <span className="text-sm text-grey-900 truncate max-w-[200px]">{value.fileName}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ file: null, fileName: null })}
            className="text-grey-600 hover:text-danger transition-colors text-sm"
          >
            <i className="ri-close-line" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`rounded-[8px] border-2 border-dashed px-4 py-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
            isDragActive ? 'border-brand-500 bg-brand-50' : 'border-grey-200 hover:border-brand-500/50 hover:bg-grey-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-8 h-8 rounded-full bg-grey-100 flex items-center justify-center">
            <i className="ri-upload-cloud-line text-grey-600 text-lg" />
          </div>
          <div className="text-center">
            <p className="text-sm text-grey-900">
              {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez ou cliquez pour parcourir'}
            </p>
            <p className="text-xs text-grey-600 mt-0.5">PDF, JPG, PNG · Max 10 Mo</p>
          </div>
        </div>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
}

export default function DocumentsForm() {
  const { state, updateSection } = usePortal()
  const router = useRouter()

  const relationsData = state.sections.relations.data ?? []
  const existing = state.sections.documents.data

  const [kbis, setKbis] = useState<DocumentFile>(existing?.kbis ?? { file: null, fileName: null })
  const [personDocs, setPersonDocs] = useState<PersonDocuments[]>(
    existing?.personDocuments ??
      relationsData.map((p) => ({
        personId: p.id,
        personName: `${p.given_names} ${p.last_name}`,
        front: { file: null, fileName: null },
        back: { file: null, fileName: null },
      }))
  )

  function updatePersonDoc(personId: string, side: 'front' | 'back', doc: DocumentFile) {
    setPersonDocs((prev) =>
      prev.map((pd) => (pd.personId === personId ? { ...pd, [side]: doc } : pd))
    )
  }

  function handleSave() {
    const data: DocumentsData = { kbis, personDocuments: personDocs }
    updateSection('documents', data)
    router.push('/dashboard')
  }

  const kbisOk = !!kbis.fileName

  return (
    <div className="flex flex-col gap-6">
      {/* Kbis */}
      <div className="bg-white rounded-[12px] border border-grey-200 p-5" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
            <i className="ri-file-text-line text-brand-500" />
          </div>
          <h3 className="font-condensed font-bold text-grey-900">Document d&apos;entreprise</h3>
        </div>
        <FileDropzone
          label="Extrait Kbis ou équivalent *"
          hint="Document officiel d'enregistrement de votre entreprise (moins de 3 mois)"
          value={kbis}
          onChange={setKbis}
        />
      </div>

      {/* Person documents */}
      {personDocs.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-condensed font-bold text-grey-900">Pièces d&apos;identité</h3>
          {personDocs.map((pd) => (
            <div key={pd.personId} className="bg-white rounded-[12px] border border-grey-200 p-5" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-grey-100 flex items-center justify-center">
                  <i className="ri-user-line text-grey-600" />
                </div>
                <p className="font-medium text-grey-900 text-sm">{pd.personName}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileDropzone
                  label="Recto"
                  value={pd.front}
                  onChange={(f) => updatePersonDoc(pd.personId, 'front', f)}
                />
                <FileDropzone
                  label="Verso"
                  value={pd.back}
                  onChange={(f) => updatePersonDoc(pd.personId, 'back', f)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {relationsData.length === 0 && (
        <div className="bg-brand-50 rounded-[8px] p-4 flex items-start gap-3">
          <i className="ri-information-line text-brand-500 mt-0.5" />
          <p className="text-sm text-brand-500">
            Complétez la section <strong>Relations d&apos;entreprise</strong> pour ajouter les pièces d&apos;identité des personnes associées.
          </p>
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
          type="button"
          onClick={handleSave}
          disabled={!kbisOk}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-[100px] font-bold text-sm transition-colors ${
            kbisOk
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
