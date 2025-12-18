import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/services/auth.service';

/**
 * Audit Log Utility: Records sensitive routing events to the Backend.
 */
async function logAction(userId: string, action: string, metadata: object, ip: string) {
  try {
    await fetch(`${process.env.BACKEND_API_URL}/api/audit-logs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_AUTH_KEY || '' 
      },
      body: JSON.stringify({ userId, action, timestamp: new Date().toISOString(), ipAddress: ip, details: metadata }),
    });
  } catch (error) {
    console.error("Audit Logging Failed:", error);
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for') || '0.0.0.0';

  // 1. Skip Public Assets and Authentication Routes
  const publicRoutes = ['/login', '/signup', '/', '/verify-email'];
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // 2. Session Integrity Check
  const session = await getSession();
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Super Admin Fast-Path
  if (session.role === 'SUPER_ADMIN') {
    if (!pathname.startsWith('/super-admin')) {
      return NextResponse.redirect(new URL('/super-admin', req.url));
    }
    return NextResponse.next();
  }

  // 4. Status Evaluation
  const isApprovedVendor = session.role === 'VENDOR' && session.kycStatus === 'VERIFIED';
  const isApprovedAdmin = session.role === 'MARKET_ADMIN' && session.adminStatus === 'APPROVED';
  
  // A user is considered "In Onboarding" if they aren't fully verified yet
  const needsOnboarding = !isApprovedVendor && !isApprovedAdmin;

  // 5. Routing Guardrails

  // A. Force Onboarding: Non-verified users must go to /apply-access
  if (needsOnboarding && pathname !== '/apply-access') {
    return NextResponse.redirect(new URL('/apply-access', req.url));
  }

  // B. Prevent Looping: Approved users shouldn't see onboarding page
  if (!needsOnboarding && pathname === '/apply-access') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // C. Portal Protection: Explicitly block cross-role access to /dashboard
  // (Assuming /dashboard is the shared entry point for approved Market/Vendor roles)
  if (pathname === '/dashboard' && needsOnboarding) {
    return NextResponse.redirect(new URL('/apply-access', req.url));
  }

  // D. Admin-Specific Portal Protection (if you have sub-routes like /market-admin/settings)
  if (pathname.startsWith('/market-admin') && !isApprovedAdmin) {
    await logAction(session.id, "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT", { pathname }, ip);
    return NextResponse.redirect(new URL('/apply-access', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};