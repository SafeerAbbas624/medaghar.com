import { buildSitemapIndexXml, getSitemapIndexEntries } from '@/lib/sitemaps'

export const revalidate = 3600

export async function GET() {
  const names = await getSitemapIndexEntries()
  return new Response(buildSitemapIndexXml(names), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
