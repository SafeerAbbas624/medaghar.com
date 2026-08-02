# OAuth Setup Guide for MedaGhar

This guide explains how to set up Google and Facebook OAuth authentication for the MedaGhar platform.

## Overview

The email verification system has been implemented with the following features:

### Email/Password Signup Flow
1. User signs up with email/password
2. A 6-digit verification code is generated and sent to their email
3. User is redirected to `/verify-email` page
4. User enters the 6-digit code
5. Upon successful verification, user can sign in
6. **Users cannot sign in until their email is verified**

### OAuth Signup Flow (Google/Facebook)
1. User clicks "Sign in with Google" or "Sign in with Facebook"
2. OAuth provider authenticates the user
3. User is automatically created in the database with `emailVerified` set to current timestamp
4. User is redirected to the home page
5. **No email verification required** (OAuth providers already verify emails)

## Setting Up Google OAuth

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth consent screen if prompted:
   - App name: **MedaGhar**
   - User support email: **info@medaghar.com**
   - Developer contact email: **info@medaghar.com**
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 3: Add to Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Setting Up Facebook OAuth

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select **Consumer** as the app type
4. Fill in the app details:
   - App name: **MedaGhar**
   - App contact email: **info@medaghar.com**
5. Click **Create App**

### Step 2: Configure Facebook Login

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** as the platform
4. Enter your site URL:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
5. Go to **Facebook Login** > **Settings**
6. Add valid OAuth redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/facebook`
   - For production: `https://yourdomain.com/api/auth/callback/facebook`
7. Save changes

### Step 3: Get App Credentials

1. Go to **Settings** > **Basic**
2. Copy the **App ID** (this is your Client ID)
3. Click **Show** next to **App Secret** and copy it (this is your Client Secret)

### Step 4: Add to Environment Variables

Add the following to your `.env` file:

```env
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
```

## Complete .env File Example

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# SMTP Configuration (for sending emails)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=info@medaghar.com
EMAIL_PASSWORD=your_email_password_here

# IMAP Configuration (for receiving emails)
EMAIL_IMAP_HOST=imap.hostinger.com
EMAIL_IMAP_PORT=993

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth (Optional)
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
```

## Testing OAuth Integration

### Development Testing

1. Start your development server: `npm run dev`
2. Navigate to the signup page: `http://localhost:3000/signup`
3. Click on "Google" or "Facebook" button
4. Complete the OAuth flow
5. You should be redirected to the home page and automatically logged in

### Production Deployment

1. Update the OAuth redirect URIs in Google Cloud Console and Facebook App settings
2. Update `NEXTAUTH_URL` in your production `.env` file
3. Ensure all environment variables are set in your production environment
4. Deploy your application

## Email Verification Features

### Rate Limiting
- Maximum 3 verification attempts per 3 minutes
- 60-second cooldown between resend requests

### Security Features
- Verification codes expire after 15 minutes
- Codes are 6 digits (100000-999999)
- Failed attempts are tracked and limited
- Automatic lockout after too many failed attempts

### User Experience
- Professional HTML email template with MedaGhar branding
- Auto-focus and auto-advance on verification code input
- Paste support for verification codes
- Clear error messages and remaining attempts display
- Resend code functionality with cooldown timer

## Troubleshooting

### OAuth buttons not appearing
- Check that environment variables are set correctly
- Restart your development server after adding environment variables

### OAuth redirect errors
- Verify that redirect URIs match exactly (including http/https)
- Check that the OAuth app is in production mode (not testing mode)

### Email verification not working
- Check SMTP credentials in `.env`
- Verify that port 465 is not blocked by your firewall
- Check server logs for email sending errors

## Support

For issues or questions, contact: **info@medaghar.com**

