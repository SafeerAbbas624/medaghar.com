import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, defaultHostingerConfig } from '@/lib/email'
import { generateVerificationEmail, generateVerificationEmailText } from '@/lib/email-templates'

const RESEND_COOLDOWN = 60 * 1000 // 60 seconds in milliseconds

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        lastVerificationSentAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Check cooldown period
    if (user.lastVerificationSentAt) {
      const timeSinceLastSent = Date.now() - new Date(user.lastVerificationSentAt).getTime()
      
      if (timeSinceLastSent < RESEND_COOLDOWN) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN - timeSinceLastSent) / 1000)
        return NextResponse.json(
          { 
            error: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
            cooldown: true,
            remainingSeconds,
          },
          { status: 429 }
        )
      }
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Update user with new code and reset attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiry,
        lastVerificationSentAt: new Date(),
        verificationAttempts: 0, // Reset attempts when new code is sent
      },
    })

    // Send verification email
    try {
      const htmlContent = generateVerificationEmail({
        firstName: user.firstName,
        verificationCode,
      })
      const textContent = generateVerificationEmailText({
        firstName: user.firstName,
        verificationCode,
      })

      await sendEmail(defaultHostingerConfig, {
        to: user.email,
        subject: 'Verify Your Email - MedaGhar',
        text: textContent,
        html: htmlContent,
      })

      console.log(`Verification email resent to ${user.email}`)

      return NextResponse.json(
        {
          message: 'Verification code sent successfully. Please check your email.',
          success: true,
        },
        { status: 200 }
      )
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Resend code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

