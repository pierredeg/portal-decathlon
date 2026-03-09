import PortalLayout from '@/components/layout/PortalLayout'
import AccountOwnerForm from '@/components/forms/AccountOwnerForm'

export default function AccountOwnerPage() {
  return (
    <PortalLayout>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-grey-600 text-sm mb-4">
            <i className="ri-user-line" />
            <span>Propriétaire du compte</span>
          </div>
          <h1 className="font-condensed font-bold text-2xl text-grey-900" style={{ letterSpacing: '-0.02em' }}>
            Qui fait la demande ?
          </h1>
          <p className="text-grey-600 text-sm mt-1">
            Informations sur la personne qui soumet ce dossier au nom de l&apos;entreprise.
          </p>
        </div>

        <div className="bg-white rounded-[12px] border border-grey-200 p-6" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
          <AccountOwnerForm />
        </div>
      </div>
    </PortalLayout>
  )
}
