import type { Metadata } from 'next'
import CategoryHub, { hubMetadata } from '@/components/tree/CategoryHub'

const PATH = '/commercial-for-rent'
const TITLE = 'Commercial Property for Rent in Pakistan'
const INTRO =
  'Shops, offices, warehouses and commercial spaces for rent across Pakistan. Find the right location for your business and contact the owner directly.'

export const revalidate = 900

export const metadata: Metadata = hubMetadata(TITLE, INTRO, PATH)

export default function Page() {
  return (
    <CategoryHub
      category="commercial"
      purpose="for-rent"
      listingType="FOR_RENT"
      title={TITLE}
      intro={INTRO}
      path={PATH}
    />
  )
}
