import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    // Skip middleware for static files, API routes, and Next.js internals
    const { pathname } = request.nextUrl
    
    // Always allow these paths to pass through
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/static/') ||
      pathname.startsWith('/@vite/') ||
      pathname.includes('.') // files with extensions
    ) {
      return NextResponse.next()
    }

    // Create response with basic security headers
    const response = NextResponse.next()
    
    // Only add essential security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
    
  } catch (error) {
    // If anything fails, just continue without middleware
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}