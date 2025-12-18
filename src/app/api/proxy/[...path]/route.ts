// The BFF Proxy Route (Catch-all): src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  const body = await req.json();
  const token = req.cookies.get('auth_token')?.value;

  // Centralized Audit Logging before proxying
  console.info(`[Audit Log] ${req.method} request to ${path} by User`);

  const response = await fetch(`${BACKEND_URL}/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

// Implement GET, PUT, DELETE similarly...