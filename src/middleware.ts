// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// rotas públicas SEM redirecionamentos automáticos
const PUBLIC = new Set(['/', '/login', '/register', '/login/forgot', '/login/reset']);

function isPublic(pathname: string) {
  if (PUBLIC.has(pathname)) return true;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js')
    return true;
  // API não é bloqueada no middleware; cada handler valida auth/RLS
  if (pathname.startsWith('/api/')) return true;
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Nunca redirecionar páginas públicas (inclui /login)
  if (isPublic(pathname)) return NextResponse.next();

  // 2) Rotas privadas: exige sessão (token NextAuth)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // em produção, os cookies são secure; esta flag evita falsos negativos
    secureCookie: process.env.NODE_ENV === 'production',
  }).catch(() => null);

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  // 3) Não fazer mais redirecionamentos aqui; /dashboard decide no server
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)'],
};
