import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mailGuard } from '@/lib/mail/api'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  const { id } = await params
  const b = await request.json().catch(() => ({}))
  const data: { name?: string; html?: string; isDefault?: boolean } = {}
  if (typeof b.name === 'string' && b.name.trim()) data.name = b.name.trim().slice(0, 100)
  if (typeof b.html === 'string' && b.html.trim()) data.html = b.html.slice(0, 20000)
  if (typeof b.isDefault === 'boolean') data.isDefault = b.isDefault
  try {
    const signature = await prisma.$transaction(async (tx) => {
      if (data.isDefault) await tx.emailSignature.updateMany({ where: { NOT: { id } }, data: { isDefault: false } })
      return tx.emailSignature.update({ where: { id }, data })
    })
    return NextResponse.json({ signature })
  } catch {
    return NextResponse.json({ error: 'Signature not found' }, { status: 404 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  const { id } = await params
  await prisma.emailSignature.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
