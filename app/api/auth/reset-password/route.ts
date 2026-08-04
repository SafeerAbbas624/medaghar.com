import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail, defaultHostingerConfig } from '@/lib/email'
import {
  generatePasswordChangedEmail,
  generatePasswordChangedEmailText,
} from '@/lib/email/notifications'
import { getRateLimiters, checkRateLimit, getClientIp } from '@/lib/rate-limiter'

const MAX_ATTEMPTS = 5
const MIN_PASSWORD_LENGTH = 8

/**
 * Verify a reset code and set a new password.
 *
 * The code is single use and dies on success, on expiry, or after five wrong
 * guesses. Without that cap a 6-digit code is worth brute forcing: a million
 * combinations is nothing to a script, and the prize is a seller account that
 * can answer enquiries about somebody else's property.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json()

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: 'Email, reset code and new password are all required' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      )
    }

    const { loginRateLimiter } = getRateLimiters()
    const limited = await checkRateLimit(loginRateLimiter, `pwreset-verify:${getClientIp(request)}`)
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait and try again.', retryAfter: limited.retryAfter },
        { status: 429 }
      )
    }

    const normalised = String(email).trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalised },
      select: {
        id: true,
        email: true,
        firstName: true,
        passwordResetCodeHash: true,
        passwordResetExpiry: true,
        passwordResetAttempts: true,
      },
    })

    // One message for every failure mode below, so a wrong code cannot be
    // told apart from an address that was never registered.
    const INVALID = NextResponse.json(
      { error: 'That reset code is invalid or has expired. Please request a new one.' },
      { status: 400 }
    )

    if (!user?.passwordResetCodeHash || !user.passwordResetExpiry) return INVALID
    if (user.passwordResetExpiry.getTime() < Date.now()) return INVALID

    if (user.passwordResetAttempts >= MAX_ATTEMPTS) {
      // Burn the code rather than leaving a guessable one sitting there.
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetCodeHash: null, passwordResetExpiry: null, passwordResetAttempts: 0 },
      })
      return INVALID
    }

    const matches = await bcrypt.compare(String(code).trim(), user.passwordResetCodeHash)
    if (!matches) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetAttempts: { increment: 1 } },
      })
      return INVALID
    }

    // Set the new password and consume the code in one write.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(password, 10),
        passwordResetCodeHash: null,
        passwordResetExpiry: null,
        passwordResetAttempts: 0,
        lastPasswordResetSentAt: null,
        // Completing this proves control of the mailbox. An account that
        // signed up but never verified is verified by getting here.
        emailVerified: new Date(),
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    })

    // Tell them it happened. If it was not them, this is the only warning
    // they will get.
    try {
      const when = new Date().toLocaleString('en-PK', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Karachi',
      })
      await sendEmail(defaultHostingerConfig, {
        to: user.email,
        subject: 'Your MedaGhar password was changed',
        text: generatePasswordChangedEmailText({ firstName: user.firstName, when }),
        html: generatePasswordChangedEmail({ firstName: user.firstName, when }),
      })
    } catch (emailError) {
      console.error('Password-changed email failed (password was still reset):', emailError)
    }

    return NextResponse.json({
      message: 'Your password has been reset. You can now sign in with it.',
    })
  } catch (error) {
    console.error('Reset-password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
