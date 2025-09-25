// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas — nunca redirecionar a partir do middleware
const PUBLIC = new Set(['/', '/login', '/register', '/login/forgot', '/login/reset']);

// Qualquer variante conhecida (v4 e v5) + regex genérica de segurança
const SESSION_COOKIE_NAMES = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  '__Secure-authjs.session-token',
  'authjs.session-token',
];

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
  // APIs validam auth nos próprios handlers
  if (pathname.startsWith('/api/')) return true;
  return false;
}

// Detecta “parece sessão” por nome de cookie (todas as variantes)
function hasSessionCookie(req: NextRequest) {
  const all = req.cookies.getAll();
  // nomes explícitos mais regex genérica (auth + session + token)
  const explicit = SESSION_COOKIE_NAMES.some((n) => !!all.find((c) => c.name === n && (c.value?.length ?? 0) > 20));
  if (explicit) return true;
  const generic = all.some((c) => {
    const n = c.name.toLowerCase();
    return /auth/.test(n) && /session/.test(n) && /token/.test(n) && (c.value?.length ?? 0) > 20;
  });
  return generic;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Nunca mexer nas rotas públicas (inclui /login)
  if (isPublic(pathname)) return NextResponse.next();

  // 2) Sinal forte: temos cookie de sessão (DB ou JWT) → deixa passar
  if (hasSessionCookie(req)) return NextResponse.next();

  // 3) Fallback: tenta decifrar JWT (quando usas strategy: 'jwt')
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  }).catch(() => null);
  if (token) return NextResponse.next();

  // 4) Relaxo do 1.º salto pós-callback (evita “voltar ao login”):
  // se o Referer vier do callback de auth, deixa passar 1 pedido para /dashboard
  const referer = req.headers.get('referer') || '';
  if (referer.includes('/api/auth/callback')) return NextResponse.next();

  // 5) Sem sessão → envia para /login com next=… (para onde voltar depois)
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|images/|manifest.*|sw\\.js|api/).*)'],
};
