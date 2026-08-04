import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import TreePage from '@/components/tree/TreePage'
import OwnerHub from '@/components/tree/OwnerHub'
import { parseTreeSegments } from '@/lib/tree/parseSegments'
import { loadTreePage, metadataFor, seedStaticParams } from '@/lib/tree/render'
import { absoluteUrl } from '@/lib/seo'

const PURPOSE = 'owner' as const

interface Props {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<Record<string, string | undefined>>
}

export function generateStaticParams() {
  return seedStaticParams(PURPOSE)
}

export const revalidate = 900

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params
  const result = parseTreeSegments(PURPOSE, segments)
  if (result.kind !== 'ok') return {}

  if (result.descriptor.level === 'root') {
    const title = 'Property for Sale by Owner in Pakistan — No Commission | MedaGhar'
    const description =
      'Buy directly from property owners across Pakistan. No agent, no commission, no middleman — contact owners directly on MedaGhar.'
    return {
      title,
      description,
      alternates: { canonical: absoluteUrl('/owner') },
      openGraph: { title, description, url: absoluteUrl('/owner'), type: 'website', siteName: 'MedaGhar' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  return metadataFor(result.descriptor)
}

export default async function OwnerTreePage({ params, searchParams }: Props) {
  const { segments } = await params
  const sp = await searchParams
  const pageParam = sp.page
  const result = parseTreeSegments(PURPOSE, segments)

  if (result.kind === 'redirect') permanentRedirect(result.canonical)
  if (result.kind === 'notFound') notFound()

  if (result.descriptor.level === 'root') return <OwnerHub searchParams={sp} />

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
