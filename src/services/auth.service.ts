// src/services/auth.service.ts
import 'server-only';
import { cookies } from 'next/headers';
import { experimental_taintUniqueValue } from 'react';

/**
 * Data Access Layer (DAL): Fetches the current session from the Backend API.
 * Uses 'server-only' to ensure this logic never executes on the client.
 */
export async function getSession() {
  try {
    // 1. Await the asynchronous cookie store (Next.js 16 requirement)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    /**
     * Security Tainting: 
     * Prevents the raw JWT from being accidentally passed to a Client Component props.
     */
 experimental_taintUniqueValue(
  'Do not pass raw session tokens to the client.',
  process.env.NODE_ENV === 'development' ? '[DEV] Token' : '[PROD] Token',
  token
);


    // 2. Internal fetch to the Express Backend (BFF)
    const res = await fetch(`${process.env.BACKEND_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Using next: { revalidate: 0 } ensures we get fresh data every time
      next: { revalidate: 0 } 
    });

    if (!res.ok) {
      // If the backend says the token is invalid, the session is null
      return null;
    }

    const sessionData = await res.json();

    // 3. Return the user object (e.g., id, email, role, kycStatus, adminStatus)
    return sessionData;

  } catch (error) {
    console.error("Auth Service: Error fetching session", error);
    return null;
  }
}