'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePortal } from '@/lib/store'

function ConfirmationContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { resetPortal } = usePortal()
  const ref = params.get('ref')

  function handleBackToHome() {
    resetPortal()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-grey-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg flex flex-col items-center text-center gap-8">
        {/* Logo Décathlon */}
        <img
          src="/logo-decathlon.svg"
          alt="Décathlon"
          className="h-20 w-auto"
        />

        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <i className="ri-check-line text-success text-4xl" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-3">
          <h1 className="font-condensed font-bold text-3xl text-grey-900" style={{ letterSpacing: '-0.02em' }}>
            Dossier soumis avec succès !
          </h1>
          <p className="text-grey-600 leading-relaxed">
            Votre dossier de partenariat a bien été reçu. Notre équipe va l&apos;analyser et vous recontactera sous 3 à 5 jours ouvrés.
          </p>
        </div>

        {/* Reference */}
        {ref && (
          <div className="w-full bg-white rounded-[12px] border border-grey-200 p-5" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
            <p className="text-grey-600 text-sm mb-2">Numéro de référence de votre dossier</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-condensed font-bold text-xl text-grey-900 tracking-wider">{ref}</span>
              <button
                onClick={() => navigator.clipboard.writeText(ref)}
                className="text-grey-600 hover:text-brand-500 transition-colors"
                title="Copier"
              >
                <i className="ri-file-copy-line" />
              </button>
            </div>
            <p className="text-grey-600 text-xs mt-2">Conservez ce numéro pour le suivi de votre dossier.</p>
          </div>
        )}

        {/* Next steps */}
        <div className="w-full flex flex-col gap-3 text-left">
          <h2 className="font-condensed font-bold text-grey-900 text-base">Prochaines étapes</h2>
          {[
            { icon: 'ri-mail-send-line', text: 'Un email de confirmation vous a été envoyé.' },
            { icon: 'ri-search-line', text: 'Notre équipe vérifie vos informations et documents.' },
            { icon: 'ri-phone-line', text: 'Un conseiller vous contacte sous 3 à 5 jours ouvrés.' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white rounded-[8px] border border-grey-200 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                <i className={`${icon} text-brand-500 text-sm`} />
              </div>
              <p className="text-grey-900 text-sm">{text}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleBackToHome}
          className="inline-flex items-center gap-2 text-brand-500 text-sm font-medium hover:underline mb-10"
        >
          <i className="ri-home-line" />
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
