import { redirect } from 'next/navigation'

export default function BuyPage() {
  redirect('/properties?listingType=FOR_SALE')
}

