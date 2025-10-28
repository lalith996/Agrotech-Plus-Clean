import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

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
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' ws: http://localhost:3000 http://127.0.0.1:8000 http://127.0.0.1:8001",
    "media-src 'self'",
    "object-src 'none'",
    "child-src 'none'",
    "worker-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
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
  }
  
  // Authentication and authorization check for protected routes
  const pathname = request.nextUrl.pathname
  
  // Allow Vite dev client and assets to bypass auth checks
  if (pathname.startsWith('/@vite/')) {
    return response
  }
  
  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/callback',
    '/auth/error',
    '/about',
    '/contact',
    '/faq',
    '/blog',
    '/products',
    '/farmers',
    '/demo-login',
    '/landing-enhanced',
    '/showcase',
    '/index.agrotrack',
    '/404',
    '/403',
    '/500',
    '/_error',
    '/offline',
    '/api/auth',
    '/api/health',
    '/api/send-email',
    '/images',
    '/manifest.json',
    '/sw.js',
    '/workbox',
    '/icons',
    '/pattern.svg',
    '/logo.svg',
    '/hero-bg.jpg',
    '/og-image.jpg'
  ]
  
  // Check if path is public or starts with public path
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    (path !== '/' && pathname.startsWith(path + '/'))
  )

  // Public API GET endpoints (return JSON and should not redirect)
  const publicApiGetPaths = [
    '/api/health',
    '/api/products',
    '/api/farmers',
  ]
  const isPublicApiGet = request.method === 'GET' && publicApiGetPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  )
  
  // Skip auth check for public paths or public GET API endpoints
  if (!isPublicPath && !isPublicApiGet) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      // Respond 401 for API requests; redirect for pages
      if (!token) {
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ success: false, message: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }
        const loginUrl = new URL('/auth/signin', request.url)
        loginUrl.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      // If token verification fails, allow the request through
      // The API routes will handle auth themselves
      console.error('[Middleware] Token verification error:', error)
    }
  }
  
  // CSRF protection for state-changing requests
  const stateMutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
  if (stateMutatingMethods.includes(request.method) && 
      request.nextUrl.pathname.startsWith('/api/')) {
    
    const csrfToken = request.headers.get('x-csrf-token')
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Check origin header
    if (origin && host && !origin.includes(host)) {
      return new NextResponse('Forbidden: Invalid origin', { status: 403 })
    }
    
    // In production, implement proper CSRF token validation
    // For now, just check that the header exists
    if (!csrfToken && process.env.NODE_ENV === 'production') {
      return new NextResponse('Forbidden: Missing CSRF token', { status: 403 })
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