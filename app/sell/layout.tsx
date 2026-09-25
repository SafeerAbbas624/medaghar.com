import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * The page itself is a client component and cannot export metadata, so the
 * canonical and social tags live here.
 */
export const metadata: Metadata = {
  title: 'Sell or Rent Out Your Property Free in Pakistan | MedaGhar',
  description:
    'Post your house, flat, plot or commercial property free on MedaGhar. No listing fee, no commission — buyers and tenants contact you directly.',
  alternates: { canonical: absoluteUrl('/sell') },
  openGraph: {
    title: 'Sell or Rent Out Your Property Free in Pakistan | MedaGhar',
    description: 'Post your house, flat, plot or commercial property free on MedaGhar. No listing fee, no commission — buyers and tenants contact you directly.',
    url: absoluteUrl('/sell'),
    type: 'website',
    siteName: 'MedaGhar',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
