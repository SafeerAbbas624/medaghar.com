import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            agentProfile: true,
          },
        })

        if (!user) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        // Check if email is verified (only for credentials login, not OAuth)
        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification code.')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar || undefined,
          phone: user.phone || undefined,
          isAgent: !!user.agentProfile,
        }
      },
    }),
    // Google OAuth Provider
    // To enable: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
    // Get credentials from: https://console.cloud.google.com/apis/credentials
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Facebook OAuth Provider
    // To enable: Set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET in .env
    // Get credentials from: https://developers.facebook.com/apps/
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in (Google, Facebook, etc.)
      if (account?.provider !== 'credentials') {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Create new user from OAuth profile
            const names = user.name?.split(' ') || ['', '']
            const firstName = names[0] || 'User'
            const lastName = names.slice(1).join(' ') || ''

            await prisma.user.create({
              data: {
                email: user.email!,
                password: '', // OAuth users don't have a password
                firstName,
                lastName,
                avatar: user.image || null,
                role: 'BUYER',
                emailVerified: new Date(), // OAuth emails are pre-verified
              },
            })
          } else if (!existingUser.emailVerified) {
            // If user exists but email not verified, verify it now (OAuth emails are trusted)
            await prisma.user.update({
              where: { email: user.email! },
              data: { emailVerified: new Date() },
            })
          }
        } catch (error) {
          console.error('Error handling OAuth sign-in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For OAuth users, fetch user data from database
        if (account?.provider !== 'credentials') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { agentProfile: true },
          })

          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.firstName = dbUser.firstName
            token.lastName = dbUser.lastName
            token.phone = dbUser.phone || undefined
            token.avatar = dbUser.avatar || undefined
            token.isAgent = !!dbUser.agentProfile
          }
        } else {
          // For credentials users, use the data from authorize
          token.id = user.id
          token.role = user.role
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.phone = user.phone
          token.avatar = user.avatar
          token.isAgent = user.isAgent
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.phone = token.phone as string | undefined
        session.user.avatar = token.avatar as string | undefined
        session.user.isAgent = token.isAgent as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

