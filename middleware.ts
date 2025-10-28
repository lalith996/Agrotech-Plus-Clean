import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security middleware for Next.js 13+
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const now = Date.now()
      const windowMs = 15 * 60 * 1000 // 15 minutes
      const maxRequests = 100 // requests per window

      let record = rateLimitStore.get(ip)

      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + windowMs }
        rateLimitStore.set(ip, record)
      }

      record.count++

      // Set rate limit headers
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString())
      response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

      if (record.count > maxRequests) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: 'Too many requests, please try again later',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
            }
          }
        )
      }
    } catch (err) {
      // In production, never crash middleware; continue request
      console.error('[Middleware] Rate limit error:', (err as Error)?.message)
    }
  }
  
  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}