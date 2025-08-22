import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/** Normaliza o role vindo do token (pode vir como 'ADMIN', 'TRAINER', 'CLIENT' ou 'admin'/'pt'/'client') */
function toAppRole(role?: unknown): 'admin' | 'pt' | 'client' {
  const r = String(role ?? '').trim();
  if (r === 'admin' || r === 'pt' || r === 'client') return r as any;
  if (r === 'ADMIN') return 'admin';
  if (r === 'TRAINER' || r === 'PT') return 'pt';
  if (r === 'CLIENT') return 'client';
  return 'client';
}

const PUBLIC = [
  /^\/login(?:\/|$)/,
  /^\/register(?:\/|$)/,
  /^\/_next\//,
  /^\/favicon/,
  /^\/api\/auth\//, // next-auth endpoints
];

const ADMIN_ONLY = [/^\/dashboard\/admin(?:\/|$)/];
const PT_ONLY = [/^\/dashboard\/pt(?:\/|$)/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // público
  if (PUBLIC.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  // precisa de sessão
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  const role = toAppRole((token as any).role);

  // regras por role
  const matches = (rules: RegExp[]) => rules.some((r) => r.test(pathname));
  if (matches(ADMIN_ONLY) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if (matches(PT_ONLY) && role !== 'pt') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/api/auth/:path*'],
};
