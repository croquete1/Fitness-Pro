// src/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { LoginSchema } from '@/lib/validation/auth';
import { checkPassword } from '@/lib/hash';

type CredRow = { id: string; email: string; password_hash?: string | null; password?: string | null };

async function findLocalCred(email: string): Promise<CredRow | null> {
  // 1) nova tabela canónica
  const a = await supabaseAdmin
    .from('auth_local_users')
    .select('id, email, password_hash')
    .eq('email', email)
    .maybeSingle<CredRow>();
  if (a.data) return a.data;

  // 2) fallback: alguns projetos usam 'users' e coluna 'password' ou 'password_hash'
  const b = await supabaseAdmin
    .from('users' as any)
    .select('id, email, password, password_hash')
    .eq('email', email)
    .maybeSingle<CredRow>();
  if (b.data) return b.data;

  return null;
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
        if (!parsed.success) {
          console.warn('[auth] payload inválido');
          return null;
        }
        const { email, password } = parsed.data;

        const cred = await findLocalCred(email);
        if (!cred) {
          console.warn('[auth] user not found:', email);
          return null;
        }

        const hash = cred.password_hash ?? cred.password ?? '';
        const ok = await checkPassword(password, hash);
        if (!ok) {
          console.warn('[auth] bad password para', email);
          return null;
        }

        // perfil / role (se existir)
        const { data: prof, error: pErr } = await supabaseAdmin
          .from('profiles')
          .select('name, role')
          .eq('email', email)
          .maybeSingle();

        if (pErr) console.error('[auth] erro supabase (profiles):', pErr.message);

        const user = {
          id: cred.id,
          email: cred.email,
          name: prof?.name ?? cred.email.split('@')[0],
          role: prof?.role ?? 'CLIENT',
        } as any;

        console.log('[auth] login LOCAL OK para', email);
        return user;
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
