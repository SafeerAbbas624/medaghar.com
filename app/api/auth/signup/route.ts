import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendEmail, defaultHostingerConfig } from '@/lib/email'
import { generateVerificationEmail, generateVerificationEmailText } from '@/lib/email-templates'

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, role } = body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Create user with verification code
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'BUYER',
        verificationCode,
        verificationCodeExpiry,
        lastVerificationSentAt: new Date(),
        emailVerified: null, // Not verified yet
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })

    // If user signed up as AGENT, create Agent profile
    if (user.role === 'AGENT') {
      await prisma.agent.create({
        data: {
          userId: user.id,
          bio: '',
          specialties: JSON.stringify([]),
          yearsExperience: 0,
          phoneNumber: user.phone || '',
          officeAddress: '',
          website: '',
        },
      })
    }

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

      console.log(`Verification email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail the signup if email fails, but log it
      // User can request a new code later
    }

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email for verification code.',
        user,
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

