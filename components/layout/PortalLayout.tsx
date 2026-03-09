import Link from 'next/link'
import type { ReactNode } from 'react'

interface PortalLayoutProps {
  children: ReactNode
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-grey-50">
      {/* Header */}
      <header className="bg-white border-b border-grey-200 sticky top-0 z-10" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center">
              <span className="text-white font-condensed font-bold text-base">D</span>
            </div>
            <span className="font-condensed font-bold text-lg text-grey-900 tracking-tight">DÉCATHLON</span>
          </Link>
          <span className="text-grey-600 text-sm hidden sm:block">Portail partenaire</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
