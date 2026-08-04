import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import TreePage from '@/components/tree/TreePage'
import { parseTreeSegments } from '@/lib/tree/parseSegments'
import { loadTreePage, metadataFor, seedStaticParams } from '@/lib/tree/render'

const PURPOSE = 'for-sale' as const

interface Props {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<Record<string, string | undefined>>
}

/** ~25 seed paths; everything else renders on demand (dynamicParams default). */
export function generateStaticParams() {
  return seedStaticParams(PURPOSE)
}

/** Counts refresh here, so a page flips out of noindex without a deploy. */
export const revalidate = 900

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params
  const result = parseTreeSegments(PURPOSE, segments)
  if (result.kind !== 'ok') return {}
  return metadataFor(result.descriptor)
}

export default async function ForSaleTreePage({ params, searchParams }: Props) {
  const { segments } = await params
  const sp = await searchParams
  const pageParam = sp.page
  const result = parseTreeSegments(PURPOSE, segments)

  if (result.kind === 'redirect') permanentRedirect(result.canonical)
  if (result.kind === 'notFound') notFound()

  // The bare /for-sale root would compete with the category hubs for
  // "property for sale in Pakistan" — send it to the residential hub.
  if (result.descriptor.level === 'root') redirect('/residential-for-sale')

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const data = await loadTreePage(result.descriptor, page, {
    minPrice: sp.minPrice,
    maxPrice: sp.maxPrice,
    bedrooms: sp.bedrooms,
    bathrooms: sp.bathrooms,
    minMarla: sp.minMarla,
    maxMarla: sp.maxMarla,
    areaSlug: sp.areaSlug,
  })

  return <TreePage descriptor={result.descriptor} {...data} />
}
