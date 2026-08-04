import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * The page itself is a client component and cannot export metadata, so the
 * canonical and social tags live here.
 */
export const metadata: Metadata = {
  title: 'Find Verified Estate Agents in Pakistan | MedaGhar',
  description:
    'Browse verified real estate agents across Lahore, Karachi, Islamabad and every major Pakistani city. Compare experience, ratings and active listings.',
  alternates: { canonical: absoluteUrl('/agents') },
  openGraph: {
    title: 'Find Verified Estate Agents in Pakistan | MedaGhar',
    description: 'Browse verified real estate agents across Lahore, Karachi, Islamabad and every major Pakistani city. Compare experience, ratings and active listings.',
    url: absoluteUrl('/agents'),
    type: 'website',
    siteName: 'MedaGhar',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
