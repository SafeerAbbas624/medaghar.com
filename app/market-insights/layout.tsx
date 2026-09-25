import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * The page itself is a client component and cannot export metadata, so the
 * canonical and social tags live here.
 */
export const metadata: Metadata = {
  title: 'Pakistan Property Market Insights & Price Trends | MedaGhar',
  description:
    'Average property prices per marla, rental yields and demand trends across Pakistani cities, compiled from live MedaGhar listings.',
  alternates: { canonical: absoluteUrl('/market-insights') },
  openGraph: {
    title: 'Pakistan Property Market Insights & Price Trends | MedaGhar',
    description: 'Average property prices per marla, rental yields and demand trends across Pakistani cities, compiled from live MedaGhar listings.',
    url: absoluteUrl('/market-insights'),
    type: 'website',
    siteName: 'MedaGhar',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
