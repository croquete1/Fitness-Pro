// src/lib/auth.ts
import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import supabaseAdmin from '@/lib/supabaseServer';
import { compare } from 'bcryptjs';

/** Mantemos os campos que a app usa */
type DbUser = {
  id: string;
  email: string | null;
  username: string | null;
  username_lower?: string | null;
  password_hash?: string | null;
  role?: string | null;
  approved?: boolean | null;
  status?: string | null; // p.ex. 'ACTIVE' / 'INACTIVE' / 'BLOCKED'
};

/** Mapa de role -> dashboard */
export function dashboardForRole(role?: string) {
  const r = (role ?? '').toUpperCase();
  if (r === 'ADMIN') return '/dashboard/admin';
  if (r === 'PT' || r === 'TRAINER') return '/dashboard/pt';
  // cliente
  return '/dashboard';
}

export const authOptions: NextAuthOptions = {
  // ⚠️ Em v4 não existe trustHost — remover
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 }, // 7 dias
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email ou username', type: 'text' },
        password:   { label: 'Password', type: 'password' },
      },
      authorize: async (creds) => {
        const identifier = creds?.identifier?.trim();
        const password = creds?.password ?? '';
        if (!identifier || password.length < 6) return null;

        const idLower = identifier.toLowerCase();

        // Procura por username_lower EXATO ou por email (case-insensitive)
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id,email,username,username_lower,password_hash,role,approved,status')
          .or(`username_lower.eq.${idLower},email.ilike.${idLower}`)
          .limit(1)
          .maybeSingle<DbUser>();

        if (error || !user || !user.password_hash) return null;

        const ok = await compare(password, user.password_hash);
        if (!ok) return null;

        // Bloqueios antes de criar sessão:
        if (user.status && user.status !== 'ACTIVE') {
          // Lança erro “amigável” que chega a res.error no signIn({ redirect:false })
          throw new Error('ACCOUNT_BLOCKED');
        }
        if (user.approved === false) {
          throw new Error('APPROVAL_REQUIRED');
        }

        // ✅ devolve o “User” para o JWT
        return {
          id: user.id,
          name: user.username ?? user.email ?? 'Utilizador',
          email: user.email ?? undefined,
          // props extra que vamos injetar no token/session
          role: user.role ?? 'client',
          approved: true,
        } as unknown as User;
      },
    }),
  ],
  callbacks: {
    // injeta dados extra no token na 1ª vez
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? 'client';
        token.approved = (user as any).approved ?? false;
      }
      return token;
    },
    // propaga do token para a session
    async session({ session, token }) {
      (session.user as any).role = (token as any).role ?? 'client';
      (session.user as any).approved = (token as any).approved ?? false;
      // útil ter o id também:
      if (token.sub) (session.user as any).id = token.sub;
      return session;
    },
    // segurança: só permite redirect interno
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        if (u.origin === baseUrl) return u.toString();
      } catch {}
      return baseUrl;
    },
  },
  logger: {
    error(code, meta) { console.error('[next-auth][error]', code, meta); },
    warn(code) { console.warn('[next-auth][warn]', code); },
    debug(code, meta) {
      if (process.env.NODE_ENV !== 'production') console.debug('[next-auth][debug]', code, meta);
    },
  },
};
