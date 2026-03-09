import PortalLayout from '@/components/layout/PortalLayout'
import DocumentsForm from '@/components/forms/DocumentsForm'

export default function DocumentsPage() {
  return (
    <PortalLayout>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-grey-600 text-sm mb-4">
            <i className="ri-file-line" />
            <span>Documents</span>
          </div>
          <h1 className="font-condensed font-bold text-2xl text-grey-900" style={{ letterSpacing: '-0.02em' }}>
            Documents à télécharger
          </h1>
          <p className="text-grey-600 text-sm mt-1">
            Uploadez le Kbis de votre entreprise et les pièces d&apos;identité des personnes associées.
          </p>
        </div>

        <DocumentsForm />
      </div>
    </PortalLayout>
  )
}
