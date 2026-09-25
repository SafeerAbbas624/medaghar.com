import { limitsForRole } from '@/lib/quota'
import { layout, textFooter, esc, SITE } from '@/lib/email/shell'
/**
 * Email Templates for MedaGhar
 * Professional HTML email templates for various user communications
 */

export interface VerificationEmailData {
  firstName: string
  verificationCode: string
}

/**
 * Verification code email.
 *
 * Deliberately does not greet with "Welcome" — the welcome email does that,
 * and a user signing up would otherwise be welcomed twice within minutes.
 * This one has a single job: deliver the code.
 */
export function generateVerificationEmail(data: VerificationEmailData): string {
  const { firstName, verificationCode } = data

  return layout(
    'Verify your email — MedaGhar',
    `      <h2>Verify your email address</h2>

      <p>Hello ${esc(firstName)}, use the code below to finish setting up your MedaGhar account.</p>

      <div class="code">
        <div class="code-label">Your verification code</div>
        <div class="code-value">${esc(verificationCode)}</div>
        <div class="muted">This code expires in 15 minutes</div>
      </div>

      <p>Enter it on the verification page and your account is ready to use.</p>

      <div class="warn">
        <strong>Never share this code.</strong> Nobody from MedaGhar will ever ask
        you for it — not by phone, not by email, not on WhatsApp.
      </div>

      <p class="muted" style="margin-top:24px;">
        If you did not create a MedaGhar account, you can ignore this email and
        nothing further will happen.
      </p>`
  )
}

/**
 * Generate plain text version of verification email (fallback)
 */
export function generateVerificationEmailText(data: VerificationEmailData): string {
  const { firstName, verificationCode } = data

  return `Verify your email address

Hello ${firstName}, use the code below to finish setting up your MedaGhar account.

Your verification code: ${verificationCode}

This code expires in 15 minutes.

Never share this code. Nobody from MedaGhar will ever ask you for it.

If you did not create a MedaGhar account, you can ignore this email.
${textFooter()}`
}


// ---------------------------------------------------------------------------
// Welcome email — sent once the account is usable.
//
// Credentials signup: sent after the email code is verified.
// Google / Facebook signup: sent immediately, since OAuth emails are already
// trusted and those users never see a verification code.
// ---------------------------------------------------------------------------

export interface WelcomeEmailData {
  firstName: string
  role?: string
}

/** Listing allowance per role, read from the shared quota table. */
function quotaLine(role?: string): string {
  const { sell, rent } = limitsForRole(role)
  if (role === 'AGENT') {
    return `As an agent you can keep up to <strong>${sell} active listings for sale</strong> and <strong>${rent} for rent</strong> at any time.`
  }
  return `Your account can keep <strong>${sell} active listings for sale</strong> and <strong>${rent} for rent</strong> at a time. Mark one as sold or rented to free a slot — upgrade to an agent account if you need more.`
}

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  return layout(
    'Welcome to MedaGhar',
    `      <h2>Welcome, ${esc(data.firstName)}</h2>

      <p>Your MedaGhar account is ready. You can now search property across Pakistan,
      save the listings you like, and deal directly with owners and agents — we never
      take commission.</p>

      <div class="panel">
        <strong>Your listing allowance</strong><br />
        ${quotaLine(data.role)}
      </div>

      <p><strong>A good place to start:</strong></p>
      <ol class="steps">
        <li><a href="${SITE}/residential-for-sale">Browse property for sale</a> in your city</li>
        <li><a href="${SITE}/sell">Post your own listing</a> — it is free</li>
        <li><a href="${SITE}/tools/mortgage-calculator">Work out your instalments</a> with the home loan calculator</li>
        <li><a href="${SITE}/guides">Read the guides</a> on transfer procedure, taxes and avoiding scams</li>
      </ol>

      <p style="text-align:center; margin-top:24px;">
        <a href="${SITE}/dashboard" class="cta">Go to your dashboard</a>
      </p>

      <p class="muted" style="margin-top:24px;">
        If you have any question, just reply to this email — it reaches a real person.
      </p>`
  )
}

export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  const quota =
    data.role === 'AGENT'
      ? 'As an agent you can keep up to 10 active listings for sale and 10 for rent at any time.'
      : 'Your account can keep 2 active listings for sale and 2 for rent at a time. Mark one as sold or rented to free a slot — upgrade to an agent account if you need more.'

  return `Welcome to MedaGhar, ${data.firstName}!

Your account is ready. You can now search property across Pakistan, save the
listings you like, and deal directly with owners and agents — we never take
commission.

YOUR LISTING ALLOWANCE
${quota}

A GOOD PLACE TO START
1. Browse property for sale:  https://medaghar.com/residential-for-sale
2. Post your own listing free: https://medaghar.com/sell
3. Home loan calculator:       https://medaghar.com/tools/mortgage-calculator
4. Property guides:            https://medaghar.com/guides

Your dashboard: https://medaghar.com/dashboard

If you have any question, just reply to this email.

—
MedaGhar — Pakistan's free property marketplace
info@medaghar.com | https://medaghar.com
`
}
