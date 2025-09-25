// middleware.ts (raiz do projeto)
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { roleToHomePath } from '@/types/auth';

const PUBLIC = new Set(['/', '/login', '/register', '/login/forgot', '/login/reset']);

function isPublicPath(pathname: string) {
  if (PUBLIC.has(pathname)) return true;
  // Assets & infra
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js') return true;
  // API é sempre pública no middleware (RLS/Auth é feito no handler)
  if (pathname.startsWith('/api/')) return true;
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  // 1) Páginas públicas
  if (isPublicPath(pathname)) {
    // Se já está autenticado e tenta entrar no login/register, envia para o home do seu role
    if (pathname === '/login' || pathname === '/register') {
      const token = await getToken({ req, secret }).catch(() => null);
      const role = (token as any)?.role as string | undefined;
      const dest = roleToHomePath(role) || '/dashboard/clients';
      if (token && dest && dest !== pathname) {
        const url = req.nextUrl.clone();
        url.pathname = dest;
        url.search = ''; // evita loops e preserva limpeza
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // 2) Rotas privadas — exige sessão
  const token = await getToken({ req, secret }).catch(() => null);
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // preserva para onde o user queria ir
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  // 3) /dashboard → envia para o dashboard por role (evita ecrã vazio)
  if (pathname === '/dashboard') {
    const role = (token as any)?.role as string | undefined;
    const dest = roleToHomePath(role) || '/dashboard/clients';
    if (dest && dest !== pathname) {
      const url = req.nextUrl.clone();
      url.pathname = dest;
      url.search = ''; // não precisamos de query aqui
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // evita aplicar em assets/APIs; cuidado com regex de sw.js
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)'],
};
