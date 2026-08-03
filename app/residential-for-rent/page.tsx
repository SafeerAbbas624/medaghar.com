import type { Metadata } from 'next'
import CategoryHub, { hubMetadata } from '@/components/tree/CategoryHub'

const PATH = '/residential-for-rent'
const TITLE = 'Residential Property for Rent in Pakistan'
const INTRO =
  'Houses, flats, upper and lower portions and rooms for rent across Pakistan. Filter by city, area and budget, then contact the landlord directly — no commission, no agent fee.'

export const revalidate = 900

export const metadata: Metadata = hubMetadata(TITLE, INTRO, PATH)

export default function Page() {
  return (
    <CategoryHub
      category="residential"
      purpose="for-rent"
      listingType="FOR_RENT"
      title={TITLE}
      intro={INTRO}
      path={PATH}
    />
  )
}
