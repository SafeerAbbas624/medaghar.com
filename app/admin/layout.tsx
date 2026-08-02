import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Medaghar',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin pages don't need navbar, footer, or compare bar
  return <>{children}</>
}

