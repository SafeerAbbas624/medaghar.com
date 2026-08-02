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
      background-color: #135422;
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
      background-color: #f0f9f1;
      border: 2px solid #135422;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      color: #135422;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .verification-code {
      font-size: 42px;
      font-weight: bold;
      color: #135422;
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
      color: #135422;
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
      color: #135422;
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

