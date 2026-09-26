import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mailGuard } from '@/lib/mail/api'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  const { id } = await params
  const b = await request.json().catch(() => ({}))
  const data: { name?: string; html?: string; category?: string; subject?: string | null } = {}
  if (typeof b.name === 'string' && b.name.trim()) data.name = b.name.trim().slice(0, 120)
  if (typeof b.html === 'string' && b.html.trim()) data.html = b.html.slice(0, 50000)
  if (typeof b.category === 'string' && b.category.trim()) data.category = b.category.trim().slice(0, 60)
  if (b.subject !== undefined) data.subject = b.subject ? String(b.subject).slice(0, 300) : null
  try {
    return NextResponse.json({ template: await prisma.emailTemplate.update({ where: { id }, data }) })
  } catch {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  const { id } = await params
  await prisma.emailTemplate.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
