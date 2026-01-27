import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle root path - rewrite to home route handler
  if (request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/home', request.url));
  }
  
  // Let other requests pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (css, js, images, fonts)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|css|js|images|fonts).*)',
  ],
};
