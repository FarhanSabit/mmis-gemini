// Server-side Data Access Layer (DAL)to ensure that database logic and sensitive credentials never leak into Client Components: src/services/auth.service.ts
import 'server-only';
import { experimental_taintUniqueValue } from 'react';

export async function getSession() {
  const token = (await import('next/headers')).cookies().get('auth_token')?.value;

  if (!token) return null;

  // Taint the token so it cannot be passed to a Client Component
  experimental_taintUniqueValue(
    'Do not pass raw session tokens to the client.',
    token,
    token
  );

  const res = await fetch(`${process.env.BACKEND_API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}