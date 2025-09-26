// src/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { LoginSchema } from '@/lib/validation/auth';
import { checkPassword } from '@/lib/hash';

type DbUser = Partial<{
  id: string; uuid: string; email: string; password_hash: string;
  name: string | null; role: 'ADMIN'|'TRAINER'|'CLIENT'|string;
  is_active: boolean | null; status: string | null; approved: boolean | null;
}>;

async function getUserByEmail(email: string): Promise<DbUser | null> {
  // tenta com colunas "ricas"
  try {
    const r = await supabaseAdmin
      .from('users')
      .select('id, uuid, email, password_hash, name, role, is_active, status, approved')
      .eq('email', email)
      .maybeSingle<DbUser>();
    if (r.data) return r.data;
    if (r.error && r.error.message) console.warn('[auth] select users (full) warn:', r.error.message);
  } catch (e) {
    console.warn('[auth] select users (full) failed, fallback simples');
  }
  // fallback: apenas o essencial (garantido pelo teu print)
  const r2 = await supabaseAdmin
    .from('users')
    .select('id, uuid, email, password_hash')
    .eq('email', email)
    .maybeSingle<DbUser>();
  return r2.data ?? null;
}

export const authOptions: NextAuthOptions = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse({
          email: credentials?.email, password: credentials?.password,
        });
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await getUserByEmail(email);
        if (!user?.email || !user.password_hash) {
          console.warn('[auth] user not found (public.users):', email);
          return null;
        }

        const ok = await checkPassword(password, user.password_hash);
        if (!ok) {
          console.warn('[auth] bad password:', email);
          return null;
        }

        // bloqueios (só se existirem as colunas)
        if (user.is_active === false || user.status === 'SUSPENDED') return null;

        const sessionUser = {
          id: user.uuid ?? user.id!, // usa uuid se existir
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
          role: (user.role as any) ?? 'CLIENT',
        } as any;

        console.log('[auth] login LOCAL OK para', email);
        return sessionUser;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = (token as any).role ?? null;
      session.user.name = (token.name as string | undefined) || session.user.name;
      return session;
    },
    async redirect({ url, baseUrl }) {
      try { const u = new URL(url, baseUrl); if (u.origin === baseUrl) return u.toString(); } catch {}
      if (url.startsWith('/')) return baseUrl + url;
      return baseUrl + '/dashboard';
    },
  },
};
