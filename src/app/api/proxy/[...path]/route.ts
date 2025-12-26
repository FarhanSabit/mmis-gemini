// The BFF Proxy Route (Catch-all): src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  const body = await req.json();
  const token = req.cookies.get('auth_token')?.value;

  // Centralized Audit Logging before proxying
  console.info(`[Audit Log] ${req.method} request to ${path} by User`);

  const response = await fetch(`${BACKEND_URL}/${path}`, {
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

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  const token = req.cookies.get('auth_token')?.value;

  // Centralized Audit Logging before proxying
  console.info(`[Audit Log] ${req.method} request to ${path} by User`);

  const response = await fetch(`${BACKEND_URL}/${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  const body = await req.json();
  const token = req.cookies.get('auth_token')?.value;

  // Centralized Audit Logging before proxying
  console.info(`[Audit Log] ${req.method} request to ${path} by User`);

  const response = await fetch(`${BACKEND_URL}/${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  const token = req.cookies.get('auth_token')?.value;

  // Centralized Audit Logging before proxying
  console.info(`[Audit Log] ${req.method} request to ${path} by User`);

  const response = await fetch(`${BACKEND_URL}/${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}