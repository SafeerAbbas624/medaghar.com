import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mailGuard } from '@/lib/mail/api'
import { ensureMailDefaults } from '@/lib/mail/compose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  await ensureMailDefaults()
  const signatures = await prisma.emailSignature.findMany({ orderBy: [{ isDefault: 'desc' }, { name: 'asc' }] })
  return NextResponse.json({ signatures })
}

export async function POST(request: NextRequest) {
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  const b = await request.json().catch(() => ({}))
  const name = String(b.name || '').trim().slice(0, 100)
  const html = String(b.html || '').slice(0, 20000)
  if (!name || !html.trim()) return NextResponse.json({ error: 'Name and signature are required' }, { status: 400 })
  const signature = await prisma.$transaction(async (tx) => {
    if (b.isDefault) await tx.emailSignature.updateMany({ data: { isDefault: false } })
    return tx.emailSignature.create({ data: { name, html, isDefault: !!b.isDefault } })
  })
  return NextResponse.json({ signature })
}
