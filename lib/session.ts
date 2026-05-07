import { cookies } from 'next/headers';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'khipu-forms-jwt-secret';
const COOKIE_NAME = 'khipu_session';

// Simple base64 JWT-like session (no crypto dep needed)
function base64url(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function fromBase64url(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

export function createSessionToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const encoded = base64url(JSON.stringify(payload));
  const signature = base64url(JWT_SECRET + encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): { id: string; email: string; name: string | null; avatar_url: string | null } | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expectedSig = base64url(JWT_SECRET + encoded);
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(fromBase64url(encoded));
    if (payload.exp < Date.now()) return null;

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      avatar_url: payload.avatar_url,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ id: string; email: string; name: string | null; avatar_url: string | null } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSession(user: User, response: Response): Promise<void> {
  const token = createSessionToken(user);
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
  );
}

export function clearSession(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
