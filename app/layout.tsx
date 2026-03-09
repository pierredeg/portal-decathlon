import type { Metadata } from 'next'
import './globals.css'
import 'remixicon/fonts/remixicon.css'
import { PortalProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Portail Partenaire — Décathlon',
  description: 'Complétez votre dossier KYB pour démarrer votre partenariat avec Décathlon.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="bg-grey-50 text-grey-900 antialiased">
        <PortalProvider>{children}</PortalProvider>
      </body>
    </html>
  )
}
