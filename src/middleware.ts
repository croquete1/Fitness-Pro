// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas (inclui /dashboard – a página decide por role no server)
const PUBLIC = new Set([
  '/', '/login', '/register', '/login/forgot', '/login/reset', '/dashboard',
]);

// Variantes conhecidas dos cookies de sessão (NextAuth v4/v5)
const SESSION_COOKIE_NAMES = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  '__Secure-authjs.session-token',
  'authjs.session-token',
];

function isPublic(pathname: string) {
  if (PUBLIC.has(pathname)) return true;
  if (
    pathname.startsWith('/_next') || pathname.startsWith('/assets') ||
    pathname.startsWith('/images') || pathname === '/favicon.ico' ||
    pathname.startsWith('/manifest') || pathname === '/sw.js')
    return true;
  if (pathname.startsWith('/api/')) return true; // cada API valida auth/owner
  return false;
}

function hasSessionCookie(req: NextRequest) {
  const all = req.cookies.getAll();
  // nomes explícitos
  if (SESSION_COOKIE_NAMES.some((n) => !!all.find((c) => c.name === n && (c.value?.length ?? 0) > 20))) return true;
  // regex genérica (auth + session + token)
  return all.some((c) => {
    const n = c.name.toLowerCase();
    return /auth/.test(n) && /session/.test(n) && /token/.test(n) && (c.value?.length ?? 0) > 20;
  });
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) nunca tocar em páginas públicas (inclui /login e /dashboard)
  if (isPublic(pathname)) return NextResponse.next();

  // 2) sessão por cookie (DB ou JWT) → passa
  if (hasSessionCookie(req)) return NextResponse.next();

  // 3) fallback JWT (strategy: 'jwt')
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  }).catch(() => null);
  if (token) return NextResponse.next();

  // 4) relaxo: 1º salto logo após callback também passa
  const referer = req.headers.get('referer') || '';
  if (referer.includes('/api/auth/callback')) return NextResponse.next();

  // 5) sem sessão → empurra para /login com next=...
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)'],
};
