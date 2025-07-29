import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, NextRequest } from 'next/server'

// Remove unused import since middlewareConfig is not used anywhere in the code

// Helper function to add security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Basic CSP, can be expanded based on application needs
  response.headers.set('Content-Security-Policy', "default-src 'self'; connect-src 'self' sea1.ingest.uploadthing.com *.uploadthing.com https://accounts.google.com https://*.vercel-insights.com https://*.vercel.app https://*.googleapis.com https://*.google.com localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://utfs.io *.uploadthing.com https://*.googleusercontent.com https://*.google.com; font-src 'self'; object-src 'none'; frame-ancestors 'self'; frame-src 'self' https://accounts.google.com https://*.google.com;");

  return response;
}

const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/sign-up',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
  // Add specific routes that were causing 404 errors
  '/_next/(.*)',
  '/api/(.*)',
  // (/secret requires auth)
]

const intlMiddleware = createMiddleware(routing)

const middleware = (req: NextRequest) => {
  const localeCodes = routing.locales; // ['en-US', 'fr', 'ar']
  const pathname = req.nextUrl.pathname;

  // Redirect non-locale-prefixed paths to default locale
  const startsWithLocale = localeCodes.some((code) =>
    pathname === `/${code}` || pathname.startsWith(`/${code}/`)
  );

  if (!startsWithLocale && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    // Redirect all paths (including root path) to include the default locale
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}${pathname}`, req.url));
  }

  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  // Check for protected paths that require authentication
  const protectedPaths = [
    /\/checkout(\/.*)?/,
    /\/account(\/.*)?/,
    /\/admin(\/.*)?/,
  ]
  
  const isProtectedPath = protectedPaths.some((pattern) => 
    pattern.test(req.nextUrl.pathname)
  )

  if (isPublicPage || !isProtectedPath) {
    // Public pages or non-protected paths
    const response = intlMiddleware(req)
    return addSecurityHeaders(response)
  } else {
    // For protected paths, check for authentication cookie
    // This is a simplified check - you'll need to implement proper auth verification
    const authCookie = req.cookies.get('next-auth.session-token') || 
                      req.cookies.get('__Secure-next-auth.session-token')
    
    if (!authCookie) {
      // Redirect to sign-in if no auth cookie is present
      const pathname = req.nextUrl.pathname || '/'
      const callbackUrl = encodeURIComponent(pathname)
      const newUrl = new URL(
        `/sign-in?callbackUrl=${callbackUrl}`,
        req.nextUrl.origin
      )
      const redirectResponse = NextResponse.redirect(newUrl)
      return addSecurityHeaders(redirectResponse)
    } else {
      // User has auth cookie, proceed with internationalization
      const response = intlMiddleware(req)
      return addSecurityHeaders(response)
    }
  }
}

export default middleware;

// Export the config
export const config = {
  // Skip all paths that should not be internationalized
  matcher: [
    // Match all paths except static files, api routes, and _next
    '/((?!api|_next|.*\.|@vite).*)',
    // Optional: Include specific paths that need middleware processing
    '/en/:path*',
    '/fr/:path*',
    '/ar/:path*'
  ],
  // Use Node.js runtime instead of Edge Runtime
  runtime: 'nodejs'
}
