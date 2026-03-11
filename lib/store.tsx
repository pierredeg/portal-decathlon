'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type {
  PortalState,
  SectionKey,
  BusinessInfoData,
  AccountOwnerData,
  PersonalInfoData,
  RelationPerson,
  DocumentsData,
  CustomFieldsData,
} from '@/types/portal'

type SectionDataMap = {
  businessInfo: BusinessInfoData
  accountOwner: AccountOwnerData
  personalInfo: PersonalInfoData
  relations: RelationPerson[]
  documents: DocumentsData
  customFields: CustomFieldsData
}

type Action =
  | { type: 'UPDATE_SECTION'; key: SectionKey; data: SectionDataMap[SectionKey] }
  | { type: 'SET_APPLICATION_ID'; id: string }
  | { type: 'SET_ENRICHED'; persons: RelationPerson[] }
  | { type: 'RESET_PORTAL' }
  | { type: 'HYDRATE'; state: PortalState }

const initialState: PortalState = {
  applicationId: null,
  relationsEnriched: false,
  sections: {
    businessInfo: { completed: false, data: null },
    accountOwner: { completed: false, data: null },
    personalInfo: { completed: false, data: null },
    relations: { completed: false, data: null },
    documents: { completed: false, data: null },
    customFields: { completed: false, data: null },
  },
}

function reducer(state: PortalState, action: Action): PortalState {
  switch (action.type) {
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.key]: {
            completed: true,
            data: action.data,
          },
        },
      }
    case 'SET_APPLICATION_ID':
      return { ...state, applicationId: action.id }
    case 'SET_ENRICHED':
      return {
        ...state,
        relationsEnriched: true,
        sections: {
          ...state.sections,
          relations: {
            // Mark completed only if not already completed by user
            completed: state.sections.relations.completed,
            data: action.persons,
          },
        },
      }
    case 'RESET_PORTAL':
      return initialState
    case 'HYDRATE':
      return { ...initialState, ...action.state }
    default:
      return state
  }
}

interface PortalContextValue {
  state: PortalState
  updateSection: <K extends SectionKey>(key: K, data: SectionDataMap[K]) => void
  setApplicationId: (id: string) => void
  setEnriched: (persons: RelationPerson[]) => void
  resetPortal: () => void
}

const PortalContext = createContext<PortalContextValue | null>(null)

const STORAGE_KEY = 'portal_decathlon_state'

function stripFileObjects(data: DocumentsData | null): DocumentsData | null {
  if (!data) return null
  const stripDoc = (d: { file: File | null; fileName: string | null; fileId?: string; expectedDocumentId?: string }) => ({
    file: null,
    fileName: d.fileName,
    fileId: d.fileId,
    expectedDocumentId: d.expectedDocumentId,
  })
  return {
    kbis: stripDoc(data.kbis),
    companyFiles: data.companyFiles?.map(stripDoc),
    personDocuments: data.personDocuments.map((pd) => ({
      ...pd,
      front: stripDoc(pd.front),
      back: stripDoc(pd.back),
    })),
    expectedDocuments: data.expectedDocuments,
  }
}

function serializeState(state: PortalState): string {
  const serializable = {
    ...state,
    sections: {
      ...state.sections,
      documents: {
        ...state.sections.documents,
        data: stripFileObjects(state.sections.documents.data),
      },
    },
  }
  return JSON.stringify(serializable)
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as PortalState
        dispatch({ type: 'HYDRATE', state: parsed })
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeState(state))
    } catch {
      // Ignore storage errors
    }
  }, [state])

  const updateSection = useCallback(<K extends SectionKey>(key: K, data: SectionDataMap[K]) => {
    dispatch({ type: 'UPDATE_SECTION', key, data })
  }, [])

  const setApplicationId = useCallback((id: string) => {
    dispatch({ type: 'SET_APPLICATION_ID', id })
  }, [])

  const setEnriched = useCallback((persons: RelationPerson[]) => {
    dispatch({ type: 'SET_ENRICHED', persons })
    // Persist synchronously so router.push doesn't race with useEffect
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const current = stored ? JSON.parse(stored) as PortalState : initialState
      const updated = {
        ...current,
        relationsEnriched: true,
        sections: {
          ...current.sections,
          relations: { completed: current.sections.relations.completed, data: persons },
        },
      }
      localStorage.setItem(STORAGE_KEY, serializeState(updated))
    } catch { /* ignore */ }
  }, [])

  const resetPortal = useCallback(() => {
    dispatch({ type: 'RESET_PORTAL' })
  }, [])

  return (
    <PortalContext.Provider value={{ state, updateSection, setApplicationId, setEnriched, resetPortal }}>
      {children}
    </PortalContext.Provider>
  )
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be used inside PortalProvider')
  return ctx
}
