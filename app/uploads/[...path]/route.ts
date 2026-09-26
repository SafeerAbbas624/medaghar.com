import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, promises as fs } from 'fs'
import path from 'path'
import { Readable } from 'stream'

/**
 * Serve uploaded photos that arrived after the last build.
 *
 * In production Next.js only serves files that were in public/ at build time.
 * Browsers get /uploads/* from nginx, but the image optimiser (/_next/image)
 * fetches the file from this server, so any photo uploaded since the last
 * deploy came back 404 and showed as broken on cards and listing pages until
 * the next rebuild. Files that existed at build time are still served by
 * Next's static handler before this route is reached.
 */

const ROOT = path.join(process.cwd(), 'public', 'uploads')
const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path
  const file = path.resolve(ROOT, ...parts)
  const type = TYPES[path.extname(file).toLowerCase()]
  if (!type || !file.startsWith(ROOT + path.sep)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  let size: number
  try {
    const st = await fs.stat(file)
    if (!st.isFile()) throw new Error('not a file')
    size = st.size
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, {
    headers: {
      'Content-Type': type,
      'Content-Length': String(size),
      // Upload filenames are unique, so the content never changes.
      'Cache-Control': 'public, max-age=2592000, immutable',
    },
  })
}
