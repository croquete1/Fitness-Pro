// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_FILE = /\.(.*)$/;

const PUBLIC_PATHS = new Set([
  '/', '/login', '/register', '/login/forgot', '/login/reset',
]);

function roleHome(role?: string | null) {
  const r = (role || '').toUpperCase();
  if (r === 'ADMIN') return '/dashboard/admin';
  if (r === 'PT' || r === 'TRAINER') return '/dashboard/pt';
  return '/dashboard';
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // permitir estáticos/rotas internas
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') // endpoints do next-auth são públicos
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.has(pathname);

  // ⚠️ usa o MESMO secret do NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // não autenticado a tentar aceder ao dashboard → mandar para login com redirect
  if (!token && pathname.startsWith('/dashboard') && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // autenticado a ir ao login/register → vai para a home por role
  if (token && (pathname === '/login' || pathname === '/register')) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(token.role as string);
    url.search = '';
    return NextResponse.redirect(url);
  }

  // só redirecionar por role no /dashboard “nu”, nunca dentro de /dashboard/admin|pt
  if (token && (pathname === '/dashboard' || pathname === '/dashboard/')) {
    const dest = roleHome(token.role as string);
    if (dest !== pathname) {
      const url = req.nextUrl.clone();
      url.pathname = dest;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // aplica a quase tudo, excepto estáticos comuns
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|images|public).*)'],
};
