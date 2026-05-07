import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.headers.set('Set-Cookie', clearSession());
  return response;
}

export async function GET(request: NextRequest) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(`${APP_URL}/login`);
  response.headers.set('Set-Cookie', clearSession());
  return response;
}
