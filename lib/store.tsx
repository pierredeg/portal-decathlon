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
} from '@/types/portal'

type SectionDataMap = {
  businessInfo: BusinessInfoData
  accountOwner: AccountOwnerData
  personalInfo: PersonalInfoData
  relations: RelationPerson[]
  documents: DocumentsData
}

type Action =
  | { type: 'UPDATE_SECTION'; key: SectionKey; data: SectionDataMap[SectionKey] }
  | { type: 'SET_APPLICATION_ID'; id: string }
  | { type: 'RESET_PORTAL' }
  | { type: 'HYDRATE'; state: PortalState }

const initialState: PortalState = {
  applicationId: null,
  sections: {
    businessInfo: { completed: false, data: null },
    accountOwner: { completed: false, data: null },
    personalInfo: { completed: false, data: null },
    relations: { completed: false, data: null },
    documents: { completed: false, data: null },
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
    case 'RESET_PORTAL':
      return initialState
    case 'HYDRATE':
      return action.state
    default:
      return state
  }
}

interface PortalContextValue {
  state: PortalState
  updateSection: <K extends SectionKey>(key: K, data: SectionDataMap[K]) => void
  setApplicationId: (id: string) => void
  resetPortal: () => void
}

const PortalContext = createContext<PortalContextValue | null>(null)

const STORAGE_KEY = 'portal_decathlon_state'

// Serialize state to localStorage (skip File objects)
function serializeState(state: PortalState): string {
  const serializable = {
    ...state,
    sections: {
      ...state.sections,
      documents: {
        ...state.sections.documents,
        data: null, // Don't persist File objects
      },
    },
  }
  return JSON.stringify(serializable)
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Hydrate from localStorage on mount
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

  // Persist to localStorage whenever state changes
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

  const resetPortal = useCallback(() => {
    dispatch({ type: 'RESET_PORTAL' })
  }, [])

  return (
    <PortalContext.Provider value={{ state, updateSection, setApplicationId, resetPortal }}>
      {children}
    </PortalContext.Provider>
  )
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be used inside PortalProvider')
  return ctx
}
