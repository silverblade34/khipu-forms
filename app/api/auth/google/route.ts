import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUserByGoogle } from '@/lib/actions';
import { createSessionToken } from '@/lib/session';

const COOKIE_NAME = 'khipu_session';

// This endpoint receives a Google ID token from the frontend
// (Google Identity Services popup flow - no redirect_uri needed)
export async function POST(request: NextRequest) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
    }

    // Verify the Google ID token using Google's tokeninfo endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const payload = await verifyRes.json();

    // Validate the audience (must be our client ID)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (payload.aud !== clientId) {
      return NextResponse.json({ error: 'Token audience mismatch' }, { status: 401 });
    }

    if (!payload.email_verified || payload.email_verified === 'false') {
      return NextResponse.json({ error: 'Email not verified' }, { status: 401 });
    }

    // Find or create user
    const user = await findOrCreateUserByGoogle({
      google_id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar_url: payload.picture,
    });

    // Create session token
    const sessionToken = createSessionToken(user);

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Google sign-in error:', err);
    return NextResponse.json({ error: 'Server error during sign-in' }, { status: 500 });
  }
}
