import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const isPublicPath = [
    '/', 
    '/login', 
    '/register', 
    '/categories', 
    '/health',
    '/ad/',
    '/api/'
  ].some(publicPath => path.startsWith(publicPath))

  // Get token from cookies or headers
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Redirect logic
  if (!isPublicPath && !token && !path.startsWith('/_next')) {
    // Redirect to login if trying to access protected route
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
