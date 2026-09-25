import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail, defaultHostingerConfig } from '@/lib/email'
import {
  generatePasswordResetEmail,
  generatePasswordResetEmailText,
} from '@/lib/email/notifications'
import { getRateLimiters, checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export const EXPIRY_MINUTES = 15
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Request a password reset code.
 *
 * Always answers the same way whether or not the address has an account.
 * Anything else turns this endpoint into a way to enumerate which of a list
 * of email addresses are registered here — worth having, to a fraudster
 * choosing which sellers to target.
 *
 * For the same reason the timing is not made constant: that would be
 * theatre, since the send itself dominates. The rate limits below are the
 * real defence against bulk probing.
 */
export async function POST(request: NextRequest) {
  const SAME_ANSWER = NextResponse.json({
    message:
      'If an account exists for that email address, a reset code has been sent to it.',
  })

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    const normalised = email.trim().toLowerCase()

    // Two limits: one on the address, so a single account cannot be mail
    // bombed, and one on the caller, so a script cannot sweep a list.
    const { emailRateLimiter, apiRateLimiter } = getRateLimiters()
    const byEmail = await checkRateLimit(emailRateLimiter, `pwreset:${normalised}`)
    const byIp = await checkRateLimit(apiRateLimiter, `pwreset-ip:${getClientIp(request)}`)
    if (!byEmail.allowed || !byIp.allowed) {
      return NextResponse.json(
        {
          error: 'Too many reset requests. Please wait a few minutes and try again.',
          retryAfter: byEmail.retryAfter ?? byIp.retryAfter,
        },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: normalised },
      select: {
        id: true,
        firstName: true,
        email: true,
        lastPasswordResetSentAt: true,
      },
    })

    // No account: say nothing, do nothing.
    if (!user) return SAME_ANSWER

    // Don't resend on every click of the button.
    if (user.lastPasswordResetSentAt) {
      const since = (Date.now() - user.lastPasswordResetSentAt.getTime()) / 1000
      if (since < RESEND_COOLDOWN_SECONDS) return SAME_ANSWER
    }

    // randomInt is drawn from the CSPRNG. Math.random is predictable enough
    // that a 6-digit code from it is worth guessing.
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    const codeHash = await bcrypt.hash(code, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCodeHash: codeHash,
        passwordResetExpiry: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
        passwordResetAttempts: 0,
        lastPasswordResetSentAt: new Date(),
      },
    })

    try {
      const payload = {
        firstName: user.firstName,
        code,
        expiryMinutes: EXPIRY_MINUTES,
      }
      await sendEmail(defaultHostingerConfig, {
        to: user.email,
        subject: 'Reset your MedaGhar password',
        text: generatePasswordResetEmailText(payload),
        html: generatePasswordResetEmail(payload),
      })
    } catch (emailError) {
      // Log, but still answer identically — the response must not reveal
      // whether the address exists, and that includes failing differently.
      console.error('Password reset email failed:', emailError)
    }

    return SAME_ANSWER
  } catch (error) {
    console.error('Forgot-password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
