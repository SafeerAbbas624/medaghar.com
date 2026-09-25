import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function withSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  )
  return response
}

function nextWithPath(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminToken = request.cookies.get('admin-token')

  // Soft-redirect old admin HTML entry points to the new ops console
  if (
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname === '/admin/dashboard' ||
    pathname === '/admin/dashboard/' ||
    pathname === '/admin/login' ||
    pathname === '/admin/login/'
  ) {
    const dest = adminToken ? '/mgh-ops/' : '/mgh-ops/login'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Protect /mgh-ops console
  if (pathname.startsWith('/mgh-ops')) {
    if (pathname === '/mgh-ops/login' || pathname.startsWith('/mgh-ops/login/')) {
      if (adminToken) {
        return NextResponse.redirect(new URL('/mgh-ops/', request.url))
      }
      return withSecurityHeaders(nextWithPath(request))
    }

    if (!adminToken) {
      const url = new URL('/mgh-ops/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    return withSecurityHeaders(nextWithPath(request))
  }

  // Remaining /admin paths (legacy files, email-previews, etc.)
  if (pathname.startsWith('/admin')) {
    if (!adminToken) {
      const url = new URL('/mgh-ops/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    return withSecurityHeaders(nextWithPath(request))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/mgh-ops/:path*'],
}
