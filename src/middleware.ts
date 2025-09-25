// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// rotas públicas: nunca redirecionar a partir daqui
const PUBLIC = new Set(['/', '/login', '/register', '/login/forgot', '/login/reset']);

// nomes possíveis de cookies de sessão (NextAuth v4 e Auth.js v5)
const SESSION_COOKIES = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  '__Secure-authjs.session-token',
  'authjs.session-token',
];

function isPublic(pathname: string) {
  if (PUBLIC.has(pathname)) return true;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js')
    return true;
  // API valida auth nos próprios handlers
  if (pathname.startsWith('/api/')) return true;
  return false;
}

function hasSessionCookie(req: NextRequest) {
  return SESSION_COOKIES.some((n) => req.cookies.get(n)?.value);
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) nunca tocar nas públicas (inclui /login)
  if (isPublic(pathname)) return NextResponse.next();

  // 2) detetar sessão por cookie (robusto p/ DB sessions e JWT)
  let authenticated = hasSessionCookie(req);

  // 3) fallback: tentar decifrar JWT se existir (caso uses strategy: 'jwt')
  if (!authenticated) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    }).catch(() => null);
    authenticated = !!token;
  }

  if (!authenticated) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  // 4) não fazer mais redirects aqui; /dashboard decide no server
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)'],
};
