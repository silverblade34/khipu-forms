import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUserByGoogle } from '@/lib/actions';
import { createSessionToken } from '@/lib/session';

const COOKIE_NAME = 'khipu_session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${APP_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(`${APP_URL}/login?error=token_failed`);
    }

    // Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`);
    }

    // Find or create user
    const user = await findOrCreateUserByGoogle({
      google_id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      avatar_url: googleUser.picture,
    });

    // Create session token
    const sessionToken = createSessionToken(user);

    // Set cookie and redirect
    const response = NextResponse.redirect(`${APP_URL}/dashboard`);
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${APP_URL}/login?error=server_error`);
  }
}
