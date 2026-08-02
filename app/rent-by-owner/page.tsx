import { redirect } from 'next/navigation'

export default function RentByOwnerPage() {
  redirect('/properties?listingType=FOR_RENT&isFSBO=true')
}

