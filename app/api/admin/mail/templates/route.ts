import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mailGuard } from '@/lib/mail/api'
import { ensureMailDefaults } from '@/lib/mail/compose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  await ensureMailDefaults()
  const templates = await prisma.emailTemplate.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] })
  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  const b = await request.json().catch(() => ({}))
  const name = String(b.name || '').trim().slice(0, 120)
  const html = String(b.html || '').slice(0, 50000)
  if (!name || !html.trim()) return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
  const template = await prisma.emailTemplate.create({
    data: {
      name,
      html,
      category: String(b.category || 'General').trim().slice(0, 60) || 'General',
      subject: b.subject ? String(b.subject).slice(0, 300) : null,
    },
  })
  return NextResponse.json({ template })
}
