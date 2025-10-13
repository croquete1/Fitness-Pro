// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Se já tiveres esta função noutro sítio, usa-a. Caso não:
function roleToHomePath(role?: string | null) {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'TRAINER':
      return '/dashboard/pt';
    case 'CLIENT':
    default:
      return '/dashboard/clients';
  }
}

const PUBLIC = new Set([
  '/', '/login', '/register', '/login/forgot', '/login/reset',
]);

function isPublic(pathname: string) {
  if (PUBLIC.has(pathname)) return true;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/brand') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js')
  {
    return true;
  }
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  // Em produção o cookie é __Secure-next-auth.session-token
  // Forçamos secureCookie para o getToken ler corretamente no Edge.
  const isProd = process.env.NODE_ENV === 'production';

  // Tenta decodificar o JWT
  const token = await getToken({ req, secret, secureCookie: isProd }).catch(() => null);

  // Fallback: se não decodificou mas já existe um cookie de sessão,
  // não bloqueamos — deixamos o server decidir (evita loop /login -> /dashboard).
  const hasSessionCookie =
    req.cookies.has('__Secure-next-auth.session-token') ||
    req.cookies.has('next-auth.session-token');

  // 1) Rota pública
  if (isPublic(pathname)) {
    // Se já tens sessão e abriste /login ou /register, segue para a home do papel
    if ((pathname === '/login' || pathname === '/register') && (token || hasSessionCookie)) {
      const dest = roleToHomePath((token as any)?.role ?? null);
      const url = req.nextUrl.clone();
      url.pathname = dest;
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2) Rota protegida sem sessão
  if (!token && !hasSessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  // 3) /dashboard "raiz" -> dashboard do papel
  if (pathname === '/dashboard') {
    const dest = roleToHomePath((token as any)?.role ?? null);
    const url = req.nextUrl.clone();
    url.pathname = dest;
    url.search = search || '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ⚠️ Não intercepta estáticos nem /api/auth/**
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/auth).*)',
  ],
};
