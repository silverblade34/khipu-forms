import { NextRequest, NextResponse } from 'next/server';
import { createGuestUser } from '@/lib/actions';
import { createSessionToken } from '@/lib/session';

const COOKIE_NAME = 'khipu_session';

export async function POST(request: NextRequest) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const guest = await createGuestUser();
    const token = createSessionToken(guest);

    const response = NextResponse.json({ success: true, redirect: '/dashboard' });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Guest login error:', err);
    return NextResponse.json({ error: 'Error al crear sesión de invitado' }, { status: 500 });
  }
}
