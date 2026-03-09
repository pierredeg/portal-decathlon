'use client'

import { usePortal } from '@/lib/store'
import PortalLayout from '@/components/layout/PortalLayout'
import SectionCard from '@/components/dashboard/SectionCard'
import ProgressBar from '@/components/dashboard/ProgressBar'
import SubmitButton from '@/components/dashboard/SubmitButton'

const SECTIONS = [
  {
    key: 'businessInfo' as const,
    title: 'Informations Business',
    description: 'Nom, pays d\'incorporation, forme juridique et numéro d\'enregistrement.',
    icon: 'ri-building-line',
    href: '/sections/business-info',
    required: true,
  },
  {
    key: 'accountOwner' as const,
    title: 'Propriétaire du compte',
    description: 'Informations sur la personne qui fait la demande.',
    icon: 'ri-user-line',
    href: '/sections/account-owner',
    required: true,
  },
  {
    key: 'personalInfo' as const,
    title: 'Informations personnelles',
    description: 'Date de naissance, nationalité et coordonnées.',
    icon: 'ri-id-card-line',
    href: '/sections/personal-info',
    required: true,
  },
  {
    key: 'relations' as const,
    title: 'Relations d\'entreprise',
    description: 'Dirigeants, actionnaires et autres personnes liées à l\'entreprise.',
    icon: 'ri-team-line',
    href: '/sections/relations',
    required: true,
  },
  {
    key: 'documents' as const,
    title: 'Documents à télécharger',
    description: 'Kbis, pièces d\'identité et autres documents requis.',
    icon: 'ri-file-line',
    href: '/sections/documents',
    required: true,
  },
  {
    key: null,
    title: 'Vérification d\'identité',
    description: 'Vérification biométrique — disponible dans une prochaine version.',
    icon: 'ri-shield-check-line',
    href: '#',
    required: false,
  },
]

export default function DashboardPage() {
  const { state } = usePortal()

  const requiredSections = SECTIONS.filter((s) => s.key !== null)
  const completedCount = requiredSections.filter((s) => s.key && state.sections[s.key].completed).length

  return (
    <PortalLayout>
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <h1 className="font-condensed font-bold text-3xl text-grey-900" style={{ letterSpacing: '-0.02em' }}>
            Mon dossier partenaire
          </h1>
          <p className="text-grey-600 mt-1">
            Complétez chaque section pour soumettre votre demande de partenariat.
          </p>
        </div>

        {/* Progress */}
        <ProgressBar completed={completedCount} total={requiredSections.length} />

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map((section) => {
            const isCompleted = section.key ? state.sections[section.key].completed : false
            const isDisabled = section.key === null

            if (isDisabled) {
              return (
                <div
                  key={section.title}
                  className="bg-white rounded-[12px] border border-grey-200 p-5 flex flex-col gap-4 opacity-60"
                  style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-full bg-grey-100 flex items-center justify-center">
                      <i className={`${section.icon} text-lg text-grey-600`} />
                    </div>
                    <span className="text-grey-600 text-xs bg-grey-100 px-2 py-0.5 rounded-full">Bientôt</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-condensed font-bold text-grey-900 text-base">{section.title}</h3>
                    <p className="text-grey-600 text-sm">{section.description}</p>
                  </div>
                </div>
              )
            }

            return (
              <SectionCard
                key={section.key}
                title={section.title}
                description={section.description}
                icon={section.icon}
                href={section.href}
                completed={isCompleted}
                required={section.required}
              />
            )
          })}
        </div>

        {/* Submit */}
        <div className="mt-4 py-6 border-t border-grey-200">
          <SubmitButton />
        </div>
      </div>
    </PortalLayout>
  )
}
