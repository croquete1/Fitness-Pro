// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC = new Set(['/login', '/register', '/forgot', '/reset']);
const FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/auth')) return NextResponse.next();
  if (pathname.startsWith('/_next') || FILE.test(pathname)) return NextResponse.next();
  if (PUBLIC.has(pathname)) return NextResponse.next();

  const token = await getToken({ req }).catch(() => null);
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)'],
};
