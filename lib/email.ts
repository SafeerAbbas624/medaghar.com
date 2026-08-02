import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content?: Buffer | string
    path?: string
  }>
}

// Create email transporter
export function createEmailTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  })
}

// Send email
export async function sendEmail(config: EmailConfig, options: SendEmailOptions) {
  const transporter = createEmailTransporter(config)

  const mailOptions = {
    from: config.user,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  }

  const info = await transporter.sendMail(mailOptions)
  return info
}

// Verify email configuration
export async function verifyEmailConfig(config: EmailConfig): Promise<boolean> {
  try {
    const transporter = createEmailTransporter(config)
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email verification failed:', error)
    return false
  }
}

// Default Hostinger configuration (to be customized)
export const defaultHostingerConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true' || true,
  user: process.env.EMAIL_USER || 'info@medaghar.com',
  password: process.env.EMAIL_PASSWORD || '',
}

