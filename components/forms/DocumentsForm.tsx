'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { usePortal } from '@/lib/store'
import { useRouter } from 'next/navigation'
import type { DocumentFile, DocumentsData, PersonDocuments, ExpectedDocument } from '@/types/portal'

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
        onChange({ ...value, file: accepted[0], fileName: accepted[0].name })
      }
    },
    [onChange, value]
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
            onClick={() => onChange({ file: null, fileName: null, expectedDocumentId: value.expectedDocumentId })}
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

  // Load expected documents from portal config
  const [expectedDocs, setExpectedDocs] = useState<ExpectedDocument[]>(existing?.expectedDocuments ?? [])
  const [configLoading, setConfigLoading] = useState(false)

  useEffect(() => {
    if (existing?.expectedDocuments?.length) return
    let cancelled = false
    setConfigLoading(true)
    fetch('/api/portal-config')
      .then((res) => {
        if (!res.ok) throw new Error(`Portal config failed: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        console.log('[Documents] Portal config loaded:', data)
        if (data.expectedDocuments?.length > 0) {
          setExpectedDocs(data.expectedDocuments)
        }
      })
      .catch(() => {
        // Portal config not available — fallback to generic document upload
      })
      .finally(() => { if (!cancelled) setConfigLoading(false) })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Split expected docs into company-level and person-level
  const companyDocs = expectedDocs.filter((d) => !d.person_specific)
  const personExpectedDocs = expectedDocs.filter((d) => d.person_specific)

  // Company-level document files (one per expected document)
  const [companyFiles, setCompanyFiles] = useState<DocumentFile[]>(
    existing?.kbis
      ? [existing.kbis]
      : companyDocs.map((d) => ({ file: null, fileName: null, expectedDocumentId: d.id }))
  )

  // Sync companyFiles when expectedDocs load
  useEffect(() => {
    if (companyDocs.length > 0 && companyFiles.length === 0) {
      setCompanyFiles(companyDocs.map((d) => ({ file: null, fileName: null, expectedDocumentId: d.id })))
    }
  }, [companyDocs.length, companyFiles.length])

  const [personDocs, setPersonDocs] = useState<PersonDocuments[]>(
    existing?.personDocuments ??
      relationsData.map((p) => ({
        personId: p.id,
        personName: `${p.given_names} ${p.last_name}`,
        front: { file: null, fileName: null, expectedDocumentId: personExpectedDocs[0]?.id },
        back: { file: null, fileName: null, expectedDocumentId: personExpectedDocs[0]?.id },
      }))
  )

  function updatePersonDoc(personId: string, side: 'front' | 'back', doc: DocumentFile) {
    setPersonDocs((prev) =>
      prev.map((pd) => (pd.personId === personId ? { ...pd, [side]: doc } : pd))
    )
  }

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function uploadSingleFile(doc: DocumentFile): Promise<DocumentFile> {
    if (!doc.file || doc.fileId) return doc
    const form = new FormData()
    form.append('file', doc.file)
    const res = await fetch('/api/files', { method: 'POST', body: form })
    if (!res.ok) throw new Error(`Upload failed: ${doc.fileName}`)
    const { fileId } = await res.json()
    return { ...doc, fileId }
  }

  async function handleSave() {
    setUploading(true)
    setUploadError(null)
    try {
      const uploadedCompanyFiles = await Promise.all(companyFiles.map(uploadSingleFile))
      setCompanyFiles(uploadedCompanyFiles)

      const uploadedPersonDocs = await Promise.all(
        personDocs.map(async (pd) => ({
          ...pd,
          front: await uploadSingleFile(pd.front),
          back: await uploadSingleFile(pd.back),
        }))
      )
      setPersonDocs(uploadedPersonDocs)

      const data: DocumentsData = {
        kbis: uploadedCompanyFiles[0] ?? { file: null, fileName: null },
        personDocuments: uploadedPersonDocs,
        expectedDocuments: expectedDocs,
      }
      updateSection('documents', data)
      router.push('/dashboard')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const hasAtLeastOneFile = companyFiles.some((f) => !!f.fileName)

  if (configLoading) {
    return (
      <div className="flex items-center gap-2 text-brand-500 text-sm py-8 justify-center">
        <i className="ri-loader-4-line animate-spin" />
        Chargement de la configuration...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Company documents */}
      {companyDocs.length > 0 ? (
        <div className="bg-white rounded-[12px] border border-grey-200 p-5" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
              <i className="ri-file-text-line text-brand-500" />
            </div>
            <h3 className="font-condensed font-bold text-grey-900">Documents d&apos;entreprise</h3>
          </div>
          <div className="flex flex-col gap-4">
            {companyDocs.map((doc, i) => (
              <FileDropzone
                key={doc.id}
                label={`${doc.name}${doc.is_mandatory ? ' *' : ''}`}
                value={companyFiles[i] ?? { file: null, fileName: null, expectedDocumentId: doc.id }}
                onChange={(f) => {
                  setCompanyFiles((prev) => {
                    const next = [...prev]
                    next[i] = { ...f, expectedDocumentId: doc.id }
                    return next
                  })
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        // Fallback: generic Kbis upload if no portal config
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
            value={companyFiles[0] ?? { file: null, fileName: null }}
            onChange={(f) => setCompanyFiles([f])}
          />
        </div>
      )}

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

      {uploadError && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/5 border border-danger/20 rounded-[8px] px-4 py-2.5">
          <i className="ri-error-warning-line" />
          {uploadError}
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
          disabled={!hasAtLeastOneFile || uploading}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-[100px] font-bold text-sm transition-colors ${
            hasAtLeastOneFile && !uploading
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'bg-grey-200 text-grey-600 cursor-not-allowed'
          }`}
        >
          {uploading ? (
            <>
              <i className="ri-loader-4-line animate-spin" />
              Upload en cours...
            </>
          ) : (
            <>
              Sauvegarder
              <i className="ri-check-line" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
