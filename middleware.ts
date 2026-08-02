import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Allow access to login page and API routes
    if (pathname === '/admin/login' || pathname.startsWith('/api/admin')) {
      return NextResponse.next()
    }

    // Check for admin session cookie
    const adminToken = request.cookies.get('admin-token')

    if (!adminToken) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Token exists, allow access.
    // Full verification happens server-side in each /api/admin route.
    const response = NextResponse.next()

    // Prevent indexing
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    )

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}