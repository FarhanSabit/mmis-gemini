// The proxy.ts Interceptor (Next.js 16) replaces the legacy middleware.ts & runs on the Node.js runtime: src/proxy.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/services/auth.service';

/**
 * Centralized Audit Log Utility
 * Logs sensitive routing events or administrative overrides to the Backend.
 */
async function logAction(userId: string, action: string, metadata: object, ip: string) {
  try {
    await fetch(`${process.env.BACKEND_API_URL}/api/audit-logs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_AUTH_KEY || '' 
      },
      body: JSON.stringify({
        userId,
        action,
        timestamp: new Date().toISOString(),
        ipAddress: ip,
        details: metadata,
      }),
    });
  } catch (error) {
    console.error("Audit Logging Failed:", error);
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for') || '0.0.0.0';

  // 1. Public Routes Bypass
  // These routes do not require a session
  const publicRoutes = ['/login', '/signup', '/', '/verify-email'];
  if (publicRoutes.some(route => pathname === route) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // 2. Session Validation
  const session = await getSession(req);

  // Redirect to login if no session/token exists
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Super Admin Enforcement
  // Super Admins must stay within /super-admin and bypass other checks
  if (session.role === 'SUPER_ADMIN') {
    if (!pathname.startsWith('/super-admin')) {
      return NextResponse.redirect(new URL('/super-admin', req.url));
    }
    return NextResponse.next();
  }

  // 4. Portal Protection (Vendors & Market Admins)
  const isApprovedVendor = session.role === 'VENDOR' && session.kycStatus === 'VERIFIED';
  const isApprovedAdmin = session.role === 'MARKET_ADMIN' && session.adminStatus === 'APPROVED';

  // Vendor Portal Protection
  if (pathname.startsWith('/vendor')) {
    if (!isApprovedVendor) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Market Admin Portal Protection
  if (pathname.startsWith('/market-admin')) {
    if (!isApprovedAdmin) {
      await logAction(session.id, "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT", { pathname }, ip);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 5. General User Catch-all
  // If a user has no approved role but tries to access role-specific portals
  const restrictedPortals = ['/vendor', '/market-admin', '/super-admin'];
  if (restrictedPortals.some(portal => pathname.startsWith(portal))) {
     return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Config to specify which paths this proxy should run on
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
};