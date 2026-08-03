import type { Metadata } from 'next'
import CategoryHub, { hubMetadata } from '@/components/tree/CategoryHub'

const PATH = '/residential-for-sale'
const TITLE = 'Residential Property for Sale in Pakistan'
const INTRO =
  'Houses, flats, plots and portions for sale across Pakistan. Browse verified listings by city and area, compare prices per marla, and contact owners and agents directly — free, with no commission.'

export const revalidate = 900

export const metadata: Metadata = hubMetadata(TITLE, INTRO, PATH)

export default function Page() {
  return (
    <CategoryHub
      category="residential"
      purpose="for-sale"
      listingType="FOR_SALE"
      title={TITLE}
      intro={INTRO}
      path={PATH}
    />
  )
}
