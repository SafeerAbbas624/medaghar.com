import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * The page itself is a client component and cannot export metadata, so the
 * canonical and social tags live here.
 */
export const metadata: Metadata = {
  title: 'Contact MedaGhar',
  description:
    'Get in touch with the MedaGhar team about listings, your account, or partnership enquiries.',
  alternates: { canonical: absoluteUrl('/contact') },
  openGraph: {
    title: 'Contact MedaGhar',
    description: 'Get in touch with the MedaGhar team about listings, your account, or partnership enquiries.',
    url: absoluteUrl('/contact'),
    type: 'website',
    siteName: 'MedaGhar',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
