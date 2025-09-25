import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC = new Set(['/', '/login', '/register', '/login/forgot', '/login/reset']);

function isPublic(pathname: string) {
  if (PUBLIC.has(pathname)) return true;
  if (
    pathname.startsWith('/_next') || pathname.startsWith('/assets') || pathname.startsWith('/images') ||
    pathname === '/favicon.ico' || pathname.startsWith('/manifest') || pathname === '/sw.js'
  ) return true;
  if (pathname.startsWith('/api/')) return true; // API valida auth no handler
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  if (isPublic(pathname)) {
    // já logado? evita voltar ao login/register
    if (pathname === '/login' || pathname === '/register') {
      const token = await getToken({ req, secret }).catch(() => null);
      if (token) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard'; // a página decide por role
        url.search = '';
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // privado → exige sessão
  const token = await getToken({ req, secret }).catch(() => null);
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)'],
};
