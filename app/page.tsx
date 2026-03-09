import Link from 'next/link'

export default function CoverPage() {
  return (
    <div className="min-h-screen bg-grey-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-8">
        {/* Logo Décathlon */}
        <img
          src="/logo-decathlon.svg"
          alt="Décathlon"
          className="h-20 w-auto"
        />

        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-500 text-sm font-medium">
          <i className="ri-shield-check-line text-base" />
          Vérification entreprise sécurisée
        </span>

        {/* Titre */}
        <div className="flex flex-col gap-3">
          <h1 className="font-condensed font-bold text-4xl md:text-5xl text-grey-900 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Portail d&apos;onboarding<br />
            <span className="text-brand-500">partenaire Décathlon</span>
          </h1>
          <p className="text-grey-600 text-lg leading-relaxed max-w-xl">
            Complétez votre dossier en quelques étapes pour démarrer votre partenariat avec Décathlon.
            Vos informations sont sécurisées et traitées de manière confidentielle.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {[
            { icon: 'ri-time-line', label: '10–15 minutes', sub: 'pour compléter votre dossier' },
            { icon: 'ri-save-line', label: 'Sauvegarde auto', sub: 'reprenez où vous en étiez' },
            { icon: 'ri-lock-line', label: 'Données sécurisées', sub: 'chiffrement bout en bout' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 bg-white rounded-[12px] border border-grey-200 p-4" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08), 0 1px 2px rgba(0,16,24,.06)' }}>
              <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                <i className={`${icon} text-brand-500 text-lg`} />
              </div>
              <span className="text-grey-900 font-medium text-sm">{label}</span>
              <span className="text-grey-600 text-xs">{sub}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[100px] bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-colors"
        >
          Commencer mon dossier
          <i className="ri-arrow-right-line text-lg" />
        </Link>

        <p className="text-grey-600 text-sm">
          Vous avez déjà commencé ?{' '}
          <Link href="/dashboard" className="text-brand-500 font-medium hover:underline">
            Reprendre mon dossier
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-16 text-grey-600 text-xs flex items-center gap-4">
        <span>© 2026 Décathlon</span>
        <span>·</span>
        <span>Portail Partenaire</span>
      </div>
    </div>
  )
}
