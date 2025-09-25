// middleware.ts (resumo do essencial)
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC = new Set(['/', '/login', '/register', '/login/forgot', '/login/reset', '/dashboard']);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.has(pathname) || pathname.startsWith('/api/') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Aceita tanto sessões por cookie (DB) como JWT (strategy: 'jwt')
  const hasCookie = ['__Secure-next-auth.session-token', 'next-auth.session-token',
                     '__Secure-authjs.session-token','authjs.session-token']
    .some((n) => req.cookies.get(n)?.value);
  if (hasCookie) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
    // se usares cookieName custom, tens de repetir aqui o mesmo nome
  }).catch(() => null);
  if (token) return NextResponse.next(); // JWT ok (strategy: 'jwt') :contentReference[oaicite:4]{index=4}

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}
