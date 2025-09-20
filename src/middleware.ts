// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas (sem sessão)
const PUBLIC_ROUTES = new Set([
  '/login',
  '/register',
  '/forgot',
  '/reset',
  '/onboarding', // o cliente pode abrir o formulário após aprovação
]);

const PUBLIC_FILE = /\.(.*)$/; // ficheiros (svg, png, etc.)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) SEMPRE permitir Next assets e ficheiros
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2) SEMPRE permitir NextAuth
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  // 3) APIs públicas específicas (ex.: webhooks, health)
  if (pathname === '/api/health') return NextResponse.next();

  // 4) Páginas públicas (login, register, etc.)
  if (PUBLIC_ROUTES.has(pathname)) return NextResponse.next();

  // 5) Checar sessão (token JWT do NextAuth)
  const token =
    (await getToken({ req })) ||
    null;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 6) (Opcional) Redirecionos por role pós-login
  // Se quiseres forçar certas áreas:
  // const role = (token as any).role as 'ADMIN' | 'PT' | 'CLIENT' | undefined;
  // if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
  //   const url = req.nextUrl.clone();
  //   url.pathname = '/dashboard';
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  // Aplica o middleware em tudo excepto assets estáticos
  matcher: ['/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)'],
};
