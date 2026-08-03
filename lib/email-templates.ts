/**
 * Email Templates for MedaGhar
 * Professional HTML email templates for various user communications
 */

export interface VerificationEmailData {
  firstName: string
  verificationCode: string
}

/**
 * Generate HTML email template for email verification
 */
export function generateVerificationEmail(data: VerificationEmailData): string {
  const { firstName, verificationCode } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - MedaGhar</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #0e7490;
      padding: 40px 20px;
      text-align: center;
    }
    .logo-img {
      width: 80px;
      height: 80px;
      margin: 0 auto 10px;
      display: block;
    }
    .logo-text {
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
      margin: 0;
      text-decoration: none;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .code-container {
      background-color: #ecfeff;
      border: 2px solid #0e7490;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      color: #0e7490;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .verification-code {
      font-size: 42px;
      font-weight: bold;
      color: #0e7490;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .expiry-notice {
      font-size: 13px;
      color: #6b7280;
      margin-top: 15px;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-text {
      font-size: 14px;
      color: #92400e;
      margin: 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }
    .footer-link {
      color: #0e7490;
      text-decoration: none;
    }
    .footer-link:hover {
      text-decoration: underline;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #0e7490;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <img src="https://medaghar.com/logo.png" alt="MedaGhar Logo" class="logo-img" />
      <h1 class="logo-text">MedaGhar</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2 class="greeting">Welcome, ${firstName}! 👋</h2>
      
      <p class="message">
        Thank you for signing up with MedaGhar, Pakistan's premier real estate platform. 
        We're excited to have you join our community!
      </p>

      <p class="message">
        To complete your registration and start exploring properties, please verify your email address 
        using the verification code below:
      </p>

      <!-- Verification Code -->
      <div class="code-container">
        <div class="code-label">Your Verification Code</div>
        <div class="verification-code">${verificationCode}</div>
        <div class="expiry-notice">⏱️ This code will expire in 15 minutes</div>
      </div>

      <p class="message">
        Simply enter this code on the verification page to activate your account and gain full access to:
      </p>

      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Browse thousands of properties across Pakistan</li>
        <li>Save your favorite listings</li>
        <li>Contact property owners and agents</li>
        <li>List your own properties</li>
        <li>And much more!</li>
      </ul>

      <!-- Security Warning -->
      <div class="warning">
        <p class="warning-text">
          <strong>🔒 Security Notice:</strong> Never share this code with anyone. MedaGhar staff will never ask for your verification code.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        <strong>MedaGhar</strong> - Your Trusted Real Estate Partner
      </p>
      <p class="footer-text">
        📧 <a href="mailto:info@medaghar.com" class="footer-link">info@medaghar.com</a>
      </p>
      <p class="footer-text" style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        If you didn't create an account with MedaGhar, please ignore this email.
      </p>
      <p class="footer-text" style="font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} MedaGhar. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of verification email (fallback)
 */
export function generateVerificationEmailText(data: VerificationEmailData): string {
  const { firstName, verificationCode } = data

  return `
Welcome to MedaGhar, ${firstName}!

Thank you for signing up with MedaGhar, Pakistan's premier real estate platform.

Your Verification Code: ${verificationCode}

This code will expire in 15 minutes.

Please enter this code on the verification page to activate your account.

If you didn't create an account with MedaGhar, please ignore this email.

---
MedaGhar - Your Trusted Real Estate Partner
Email: info@medaghar.com
© ${new Date().getFullYear()} MedaGhar. All rights reserved.
  `.trim()
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

/** Listing allowance per role, mirroring QUOTA_LIMITS in the properties API. */
function quotaLine(role?: string): string {
  if (role === 'AGENT') {
    return 'As an agent you can keep up to <strong>10 active listings for sale</strong> and <strong>10 for rent</strong> at any time.'
  }
  return 'Your account can keep <strong>2 active listings for sale</strong> and <strong>2 for rent</strong> at a time. Mark one as sold or rented to free a slot — upgrade to an agent account if you need more.'
}

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to MedaGhar</title>
  <style>
    body { margin:0; padding:0; background-color:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; }
    .wrap { max-width:600px; margin:0 auto; background:#ffffff; }
    .header { background-color:#0e7490; padding:32px 24px; text-align:center; }
    .logo-img { width:64px; height:64px; object-fit:contain; }
    .logo-text { color:#ffffff; font-size:26px; font-weight:700; margin:8px 0 0; }
    .body { padding:32px 24px; color:#334155; font-size:15px; line-height:1.65; }
    h2 { color:#0f172a; font-size:21px; margin:0 0 16px; }
    .cta { display:inline-block; background-color:#0e7490; color:#ffffff !important; text-decoration:none; padding:13px 34px; border-radius:10px; font-weight:600; margin:8px 0; }
    .panel { background:#ecfeff; border:1px solid #a5f3fc; border-radius:10px; padding:16px 20px; margin:21px 0; }
    .steps { padding-left:20px; margin:8px 0; }
    .steps li { margin-bottom:8px; }
    .footer { background:#f9fafb; padding:24px; text-align:center; color:#64748b; font-size:13px; }
    .footer a { color:#0e7490; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <img src="https://medaghar.com/logo.png" alt="MedaGhar" class="logo-img" />
      <h1 class="logo-text">MedaGhar</h1>
    </div>

    <div class="body">
      <h2>Welcome, ${data.firstName}!</h2>

      <p>Your MedaGhar account is ready. You can now search property across Pakistan, save the listings you like, and deal directly with owners and agents — we never take commission.</p>

      <div class="panel">
        <strong>Your listing allowance</strong><br />
        ${quotaLine(data.role)}
      </div>

      <p><strong>A good place to start:</strong></p>
      <ol class="steps">
        <li><a href="https://medaghar.com/residential-for-sale" style="color:#0e7490;">Browse property for sale</a> in your city</li>
        <li><a href="https://medaghar.com/sell" style="color:#0e7490;">Post your own listing</a> — it is free</li>
        <li><a href="https://medaghar.com/tools/mortgage-calculator" style="color:#0e7490;">Work out your instalments</a> with the home loan calculator</li>
        <li><a href="https://medaghar.com/guides" style="color:#0e7490;">Read the guides</a> on transfer procedure, taxes and avoiding scams</li>
      </ol>

      <p style="text-align:center; margin-top:24px;">
        <a href="https://medaghar.com/dashboard" class="cta">Go to your dashboard</a>
      </p>

      <p style="margin-top:24px; font-size:14px; color:#64748b;">
        If you have any question, just reply to this email — it reaches a real person.
      </p>
    </div>

    <div class="footer">
      <p style="margin:0 0 8px;"><strong>MedaGhar</strong> — Pakistan's free property marketplace</p>
      <p style="margin:0;">
        <a href="mailto:info@medaghar.com">info@medaghar.com</a> &nbsp;·&nbsp;
        <a href="https://medaghar.com">medaghar.com</a>
      </p>
    </div>
  </div>
</body>
</html>`
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
