import type { Metadata } from 'next'
import CategoryHub, { hubMetadata } from '@/components/tree/CategoryHub'

const PATH = '/commercial-for-sale'
const TITLE = 'Commercial Property for Sale in Pakistan'
const INTRO =
  'Shops, offices, warehouses, factories and commercial plots for sale across Pakistan. Compare locations and prices, then deal directly with owners and agents.'

export const revalidate = 900

export const metadata: Metadata = hubMetadata(TITLE, INTRO, PATH)

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams
  return (
    <CategoryHub
      searchParams={sp}
      category="commercial"
      purpose="for-sale"
      listingType="FOR_SALE"
      title={TITLE}
      intro={INTRO}
      path={PATH}
    />
  )
}
