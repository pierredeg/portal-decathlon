import PortalLayout from '@/components/layout/PortalLayout'
import RelationsForm from '@/components/forms/RelationsForm'

export default function RelationsPage() {
  return (
    <PortalLayout>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-grey-600 text-sm mb-4">
            <i className="ri-team-line" />
            <span>Relations d&apos;entreprise</span>
          </div>
          <h1 className="font-condensed font-bold text-2xl text-grey-900" style={{ letterSpacing: '-0.02em' }}>
            Personnes liées à l&apos;entreprise
          </h1>
          <p className="text-grey-600 text-sm mt-1">
            Ajoutez les dirigeants, actionnaires et bénéficiaires effectifs (UBO) de votre entreprise.
          </p>
        </div>

        <div className="bg-white rounded-[12px] border border-grey-200 p-6" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
          <RelationsForm />
        </div>
      </div>
    </PortalLayout>
  )
}
