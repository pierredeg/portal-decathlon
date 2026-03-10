'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePortal } from '@/lib/store'
import type { ReactNode } from 'react'

interface PortalLayoutProps {
  children: ReactNode
}

function LogoWithReset() {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const { resetPortal } = usePortal()
  const router = useRouter()

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    setPos({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  function handleReset() {
    setOpen(false)
    resetPortal()
    localStorage.removeItem('portal_decathlon_state')
    router.push('/')
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <>
      <div onContextMenu={handleContextMenu} className="cursor-pointer select-none">
        <Link href="/" className="flex items-center">
          <img src="/logo-decathlon.svg" alt="Décathlon" className="h-14 w-auto" />
        </Link>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-grey-200 rounded-[8px] py-1 min-w-[200px]"
          style={{
            top: pos.y,
            left: pos.x,
            boxShadow: '0 1px 3px rgba(0,16,24,.08), 0 1px 2px rgba(0,16,24,.06)',
          }}
        >
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-grey-600 hover:bg-grey-50 hover:text-grey-900 transition-colors text-left"
          >
            🔄 Réinitialiser le dossier
          </button>
        </div>
      )}
    </>
  )
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-grey-50">
      <header className="bg-white border-b border-grey-200 sticky top-0 z-10" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <LogoWithReset />
          <span className="text-grey-600 text-sm hidden sm:block">Portail partenaire</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
