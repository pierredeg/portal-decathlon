'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SearchResult {
  name: string
  registration_number: string
  source: string
}

export interface CompanyDetails {
  organization_name: string
  registration_number: string
  legal_type_raw: string
  legal_type: string
  country_code: string
  official_address: {
    building_number: string
    street: string
    town: string
    postcode: string
    country: string
  }
}

interface CompanySearchProps {
  country: string
  onSelect: (company: CompanyDetails) => void
}

export default function CompanySearch({ country, onSelect }: CompanySearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string, c: string) => {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/company-search?q=${encodeURIComponent(q)}&country=${c}`)
      if (res.ok) {
        const data: SearchResult[] = await res.json()
        setResults(data.slice(0, 5))
        setOpen(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val, country), 300)
  }

  async function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery(result.name)
    setLoadingDetails(result.registration_number)
    try {
      const res = await fetch(
        `/api/company-details?siren=${encodeURIComponent(result.registration_number)}&country=${country}`
      )
      if (res.ok) {
        const details: CompanyDetails = await res.json()
        onSelect(details)
      }
    } finally {
      setLoadingDetails(null)
    }
  }

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-grey-900">
        Rechercher votre entreprise
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {loading || loadingDetails ? (
            <i className="ri-loader-4-line text-grey-600 text-base animate-spin" />
          ) : (
            <i className="ri-search-line text-grey-600 text-base" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Nom ou SIREN de votre entreprise..."
          className="h-11 w-full rounded-[8px] border border-grey-300 pl-9 pr-3.5 text-sm text-grey-900 placeholder:text-grey-600 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
          style={{ borderWidth: '1.5px' }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-[8px] border border-grey-200 overflow-hidden"
          style={{ boxShadow: '0 4px 6px rgba(0,16,24,.07), 0 2px 4px rgba(0,16,24,.06)' }}
        >
          {results.map((r) => (
            <button
              key={r.registration_number}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand-50 transition-colors border-b border-grey-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-grey-900">{r.name}</p>
                <p className="text-xs text-grey-600">{r.registration_number}</p>
              </div>
              {loadingDetails === r.registration_number ? (
                <i className="ri-loader-4-line text-brand-500 text-base animate-spin flex-shrink-0" />
              ) : (
                <i className="ri-arrow-right-s-line text-grey-600 text-base flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
