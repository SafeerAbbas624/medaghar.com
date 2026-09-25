import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp, getRateLimiters } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const { formRateLimiter } = getRateLimiters()
    const rl = await checkRateLimit(formRateLimiter, `contact:${getClientIp(request)}`)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 600) } }
      )
    }

    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create contact submission
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      contactId: contact.id,
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}

