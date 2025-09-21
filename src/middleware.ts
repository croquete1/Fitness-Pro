// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_FILE = /\.(.*)$/;
const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/login/forgot', '/login/reset']);

function roleHome(role?: string | null) {
  const r = (role || '').toUpperCase();
  if (r === 'ADMIN') return '/dashboard/admin';
  if (r === 'PT' || r === 'TRAINER') return '/dashboard/pt';
  return '/dashboard';
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) deixar passar estáticos e tudo em /api/*
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') // <-- deixa as rotas API fora do middleware
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.has(pathname);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 2) proteger /dashboard/* quando não autenticado
  if (!token && pathname.startsWith('/dashboard') && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // 3) autenticado a ir ao login/register -> manda para a “home” por role
  if (token && (pathname === '/login' || pathname === '/register')) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(token.role as string);
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 4) só redirecionar por role no /dashboard raiz
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|images|public).*)'],
};
