import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ficheiros públicos (não interceptar)
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // ignorar assets, next internals e rota do service worker
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/notifications/webpush-sw.js')
  {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const requiresAuth =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/pt') ||
    pathname.startsWith('/api/client');

  // sem sessão → mandar para login com "next" (evita loop)
  if (!isLoggedIn && requiresAuth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // com sessão → se estiver em /login|/register, empurrar para /dashboard (uma só vez)
  if (isLoggedIn && isAuthPage) {
    const dashUrl = new URL('/dashboard', req.url);
    if (dashUrl.pathname !== pathname) {
      return NextResponse.redirect(dashUrl);
    }
  }

  // default
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apanha tudo excepto assets estáticos
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|public).*)',
  ],
};
