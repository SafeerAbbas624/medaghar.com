import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Property lead capture. Leads are stored as Contact submissions with a
 * structured subject so they appear in the admin "Contact Submissions" tab
 * and can be sold/forwarded to agents.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, name, phone, email, message, intent } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 })
    }

    const phoneDigits = String(phone).replace(/[^0-9+]/g, '')
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 })
    }

    let propertyLabel = 'General enquiry'
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { address: true, city: true },
      })
      if (property) propertyLabel = `${property.address}, ${property.city} [${propertyId}]`
    }

    const lead = await prisma.contact.create({
      data: {
        name,
        email: email || 'no-email@lead.medaghar.com',
        phone: phoneDigits,
        subject: `Property Lead${intent ? ` (${intent})` : ''} — ${propertyLabel}`,
        message: message || 'Requested a callback about this property.',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you! We have received your request and will call you back shortly.',
      leadId: lead.id,
    })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ error: 'Failed to submit your request' }, { status: 500 })
  }
}
