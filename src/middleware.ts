// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Ignorar assets e rotas públicas
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Ler JWT do NextAuth (tem de usar o MESMO NEXTAUTH_SECRET)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  // 1) Bloquear /dashboard* para não autenticados
  if (!isAuth && pathname.startsWith('/dashboard')) {
    const url = new URL('/login', req.nextUrl.origin);
    // manter para onde querias ir, para depois do login
    url.searchParams.set('redirect', pathname + (req.nextUrl.search || ''));
    return NextResponse.redirect(url);
  }

  // 2) Mandar utilizadores autenticados para a dashboard se abrirem /login ou /register
  if (isAuth && (pathname === '/login' || pathname.startsWith('/register'))) {
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
