import type { Metadata } from 'next'

/**
 * /properties is the in-app faceted search: the SearchAction target in
 * webSiteJsonLd, the saved-search destination, and the filter escape hatch.
 * It stays for those flows, but it duplicates the tree, so it must not
 * compete with it for indexation. `follow` keeps equity flowing to listings.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
