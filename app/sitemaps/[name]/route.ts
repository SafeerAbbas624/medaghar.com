import { NextRequest } from 'next/server'
import { buildSitemapXml, getAllShards } from '@/lib/sitemaps'

export const revalidate = 3600

// Property shards are dynamic (counts change), so we don't pre-render any.
// dynamicParams (default true) lets unknown-at-build names resolve at request time.
export function generateStaticParams() {
  return [] as { name: string }[]
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const shardName = name.replace(/\.xml$/, '')
  const shards = await getAllShards()
  const shard = shards.find((s) => s.name === shardName)
  if (!shard) {
    return new Response('Not found', { status: 404 })
  }
  return new Response(buildSitemapXml(shard.entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
