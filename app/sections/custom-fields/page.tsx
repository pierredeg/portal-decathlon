import PortalLayout from '@/components/layout/PortalLayout'
import CustomFieldsForm from '@/components/forms/CustomFieldsForm'

export default function CustomFieldsPage() {
  return (
    <PortalLayout>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-grey-600 text-sm mb-4">
            <i className="ri-list-settings-line" />
            <span>Informations additionnelles</span>
          </div>
          <h1 className="font-condensed font-bold text-2xl text-grey-900" style={{ letterSpacing: '-0.02em' }}>
            Informations additionnelles
          </h1>
          <p className="text-grey-600 text-sm mt-1">
            Complétez les informations spécifiques demandées pour votre dossier.
          </p>
        </div>

        <div className="bg-white rounded-[12px] border border-grey-200 p-6" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
          <CustomFieldsForm />
        </div>
      </div>
    </PortalLayout>
  )
}
