import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * The page itself is a client component and cannot export metadata, so the
 * canonical and social tags live here.
 */
export const metadata: Metadata = {
  title: 'Property & Agent Reviews | MedaGhar',
  description:
    'Read reviews of properties and estate agents across Pakistan from real MedaGhar users.',
  alternates: { canonical: absoluteUrl('/reviews') },
  openGraph: {
    title: 'Property & Agent Reviews | MedaGhar',
    description: 'Read reviews of properties and estate agents across Pakistan from real MedaGhar users.',
    url: absoluteUrl('/reviews'),
    type: 'website',
    siteName: 'MedaGhar',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
