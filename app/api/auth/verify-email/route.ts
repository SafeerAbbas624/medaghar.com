import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, defaultHostingerConfig } from '@/lib/email'
import { generateWelcomeEmail, generateWelcomeEmailText } from '@/lib/email-templates'

const MAX_VERIFICATION_ATTEMPTS = 3
const LOCKOUT_DURATION = 3 * 60 * 1000 // 3 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
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
        role: true,
        emailVerified: true,
        verificationCode: true,
        verificationCodeExpiry: true,
        verificationAttempts: true,
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

    // Check if verification code exists
    if (!user.verificationCode || !user.verificationCodeExpiry) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new code.' },
        { status: 400 }
      )
    }

    // Check rate limiting - if too many failed attempts
    if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      const timeSinceLastAttempt = user.lastVerificationSentAt 
        ? Date.now() - new Date(user.lastVerificationSentAt).getTime()
        : LOCKOUT_DURATION + 1

      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        const remainingMinutes = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000)
        return NextResponse.json(
          { 
            error: `Too many failed attempts. Please try again in ${remainingMinutes} minute(s).`,
            locked: true,
            remainingMinutes,
          },
          { status: 429 }
        )
      } else {
        // Reset attempts after lockout period
        await prisma.user.update({
          where: { id: user.id },
          data: { verificationAttempts: 0 },
        })
      }
    }

    // Check if code has expired
    if (new Date() > new Date(user.verificationCodeExpiry)) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    // Verify the code
    if (user.verificationCode !== code.trim()) {
      // Increment failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationAttempts: user.verificationAttempts + 1,
        },
      })

      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - (user.verificationAttempts + 1)
      
      if (remainingAttempts <= 0) {
        return NextResponse.json(
          { 
            error: 'Invalid verification code. Too many failed attempts. Please request a new code.',
            locked: true,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          error: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      )
    }

    // Code is valid - verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationCodeExpiry: null,
        verificationAttempts: 0,
      },
    })

    // Welcome email — the account only becomes usable at this point, so this
    // is the right moment rather than at signup. Never block verification on it.
    try {
      await sendEmail(defaultHostingerConfig, {
        to: user.email,
        subject: 'Welcome to MedaGhar 🏡',
        text: generateWelcomeEmailText({ firstName: user.firstName, role: user.role }),
        html: generateWelcomeEmail({ firstName: user.firstName, role: user.role }),
      })
    } catch (emailError) {
      console.error('Welcome email failed (verification still succeeded):', emailError)
    }

    return NextResponse.json(
      {
        message: 'Email verified successfully! You can now sign in.',
        success: true,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

