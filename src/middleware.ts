import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { roleToHomePath } from '@/types/auth';

const PUBLIC = ['/', '/login', '/register', '/login/forgot', '/login/reset'];

function isPublic(pathname: string) {
  if (PUBLIC.includes(pathname)) return true;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js'
  ) return true;
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  if (isPublic(pathname)) {
    if (pathname === '/login' || pathname === '/register') {
      const token = await getToken({ req, secret });
      const role = (token as any)?.role as string | undefined;
      if (role) {
        const dest = roleToHomePath(role);
        if (dest !== pathname) {
          const url = req.nextUrl.clone();
          url.pathname = dest;
          url.search = '';
          return NextResponse.redirect(url);
        }
      }
    }
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = `?next=${encodeURIComponent(pathname + (search ?? ''))}`;
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/dashboard') {
    const dest = roleToHomePath((token as any)?.role as string | undefined);
    if (dest && dest !== pathname) {
      const url = req.nextUrl.clone();
      url.pathname = dest;
      url.search = search ?? '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)',
  ],
};
