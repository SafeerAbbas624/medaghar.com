import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

/** Toggle monetization/trust flags on a listing (featured, verified, status). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const data: { isFeatured?: boolean; isVerified?: boolean; status?: never } = {}
  if (typeof body.isFeatured === 'boolean') data.isFeatured = body.isFeatured
  if (typeof body.isVerified === 'boolean') data.isVerified = body.isVerified

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    const property = await prisma.property.update({
      where: { id },
      data,
      select: { id: true, isFeatured: true, isVerified: true },
    })
    return NextResponse.json({ success: true, property })
  } catch {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }
}
