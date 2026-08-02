import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export interface AdminSession {
  id: string
  email: string
  role: string
  roleId: string
  permissions: any[]
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')

    if (!token) {
      return null
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('NEXTAUTH_SECRET not configured')
      return null
    }

    const decoded = verify(
      token.value,
      secret
    ) as AdminSession

    return decoded
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return null
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')
}

