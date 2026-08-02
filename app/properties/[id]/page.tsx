import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { getPropertyBySlugOrId } from '@/lib/getProperty'
import { buildPropertyUrl } from '@/lib/propertyUrl'

interface Props { params: Promise<{ id: string }> }

export default async function LegacyPropertyRedirect({ params }: Props) {
  const { id } = await params
  const property = await getPropertyBySlugOrId(id)
  if (!property) notFound()
  redirect(buildPropertyUrl(property))   // 308 permanent by default in Next; acceptable
}
