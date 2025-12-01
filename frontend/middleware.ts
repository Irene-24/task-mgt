import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if accessing auth pages
  if (pathname.startsWith('/auth')) {
    // Check for refresh token cookie (indicates authenticated user)
    const refreshToken = request.cookies.get('refreshToken');
    
    if (refreshToken) {
      // User is authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*'],
};
