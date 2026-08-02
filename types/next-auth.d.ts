import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      roleId?: string
      firstName: string
      lastName: string
      phone?: string
      avatar?: string
      isAgent: boolean
      permissions?: any[]
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    roleId?: string
    firstName: string
    lastName: string
    phone?: string
    avatar?: string
    isAgent: boolean
    permissions?: any[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    roleId?: string
    firstName: string
    lastName: string
    phone?: string
    avatar?: string
    isAgent: boolean
    permissions?: any[]
  }
}

