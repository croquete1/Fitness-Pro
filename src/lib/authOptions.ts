// src/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { LoginSchema } from '@/lib/validation/auth';
import { checkPassword } from '@/lib/hash';

type BaseUser = { id: string; email: string; password_hash: string };
type ExtraUser = Partial<{
  name: string | null;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT' | string | null;
  is_active: boolean | null;
  status: string | null;
  approved: boolean | null;
}>;

// 1) Só pedimos colunas garantidas; 2) depois tentamos extras (se existirem)
async function getUserByEmail(email: string) {
  const base = await supabaseAdmin
    .from('users')
    .select('id,email,password_hash')
    .eq('email', email)
    .maybeSingle<BaseUser>();
  if (!base.data) return null;

  const extra = await supabaseAdmin
    .from('users')
    .select('name,role,is_active,status,approved')
    .eq('id', base.data.id)
    .maybeSingle<ExtraUser>();

  return { ...base.data, ...(extra.data ?? {}) };
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
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await getUserByEmail(email);
        if (!user) {
          console.warn('[auth] user not found (public.users):', email);
          return null;
        }

        const ok = await checkPassword(password, user.password_hash);
        if (!ok) {
          console.warn('[auth] bad password:', email);
          return null;
        }

        // bloqueios (só se as colunas existirem)
        if (user.is_active === false || user.status === 'SUSPENDED') return null;

        const sessionUser = {
          id: user.id,
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
