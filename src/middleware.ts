import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = (req as any).nextauth?.token as any;
    const role = String(token?.role || '').toUpperCase();

    const { pathname } = req.nextUrl;

    // bloqueios por segmento
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (pathname.startsWith('/dashboard/pt') && !['PT', 'TRAINER', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // área cliente (raiz) – todos os logados podem ver, mas se for admin e pedir /dashboard, mantém
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // requer sessão para tudo que a matcher cobrir
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
