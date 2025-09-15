// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Helpers
 */
const PUBLIC_PATHS = [
  '/', '/login', '/register',
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;

  // Não interceptar assets, next internals e APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js' ||
    pathname.startsWith('/api') // não mexer nas rotas API no middleware
  ) {
    return true;
  }

  return false;
}

type Role = 'ADMIN' | 'PT' | 'CLIENT';

function toRole(input: unknown): Role | null {
  const r = String(input ?? '').toUpperCase();
  if (r === 'ADMIN' || r === 'PT' || r === 'CLIENT') return r;
  return null;
}

function homeFor(role: Role | null): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'PT':
      return '/dashboard/pt';
    case 'CLIENT':
    default:
      // Mantém compat com código existente que usava /dashboard/clients
      return '/dashboard/clients';
  }
}

const ADMIN_ONLY = [/^\/dashboard\/admin(\/|$)/];
const PT_ONLY = [/^\/dashboard\/pt(\/|$)/];

function matchesAny(pathname: string, patterns: RegExp[]) {
  return patterns.some((re) => re.test(pathname));
}

/**
 * Middleware
 */
export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Paths públicos/estáticos
  if (isPublicPath(pathname)) {
    // Se já autenticado e a abrir /login ou /register, envia para a home da role
    if (pathname === '/login' || pathname === '/register') {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      const role = toRole((token as any)?.role ?? (token as any)?.user?.role);
      if (role) {
        const url = req.nextUrl.clone();
        url.pathname = homeFor(role);
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // Qualquer outra rota (ex.: /dashboard/**) precisa de sessão
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // Sem sessão → login com ?next= para retornar depois
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = `?next=${encodeURIComponent(pathname + (search ?? ''))}`;
    return NextResponse.redirect(loginUrl);
  }

  const role = toRole((token as any)?.role ?? (token as any)?.user?.role);

  // Acedeu ao /dashboard raiz → mandar para home da role
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    const url = req.nextUrl.clone();
    url.pathname = homeFor(role);
    return NextResponse.redirect(url);
  }

  // Guardas por área
  if (matchesAny(pathname, ADMIN_ONLY) && role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = homeFor(role);
    return NextResponse.redirect(url);
  }

  if (matchesAny(pathname, PT_ONLY) && role !== 'PT') {
    const url = req.nextUrl.clone();
    url.pathname = homeFor(role);
    return NextResponse.redirect(url);
  }

  // (Opcional) Poderias criar CLIENT_ONLY se precisares de restringir páginas
  // específicas do cliente, mas na maioria dos casos não é necessário aqui.

  return NextResponse.next();
}

/**
 * Matcher — evita estáticos e imagens.
 * Se tiveres rotas públicas adicionais, adiciona-as na função isPublicPath.
 */
export const config = {
  matcher: [
    // Intercepta tudo menos estáticos/Imagens/API
    '/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)',
  ],
};
