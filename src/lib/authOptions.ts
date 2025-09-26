// src/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { LoginSchema } from '@/lib/validation/auth';
import { checkPassword } from '@/lib/hash';

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

        // 1) obter credencial local
        const { data: cred, error: cErr } = await supabaseAdmin
          .from('auth_local_users')
          .select('id, email, password_hash')
          .eq('email', email)
          .maybeSingle();

        if (cErr) {
          console.error('[auth] erro supabase (auth_local_users):', cErr.message);
          return null;
        }
        if (!cred) {
          console.warn('[auth] user not found:', email);
          return null;
        }

        // 2) comparar bcrypt
        const ok = await checkPassword(password, cred.password_hash);
        if (!ok) {
          console.warn('[auth] bad password para', email);
          return null;
        }

        // 3) perfil/role
        const { data: prof, error: pErr } = await supabaseAdmin
          .from('profiles')
          .select('name, role')
          .eq('email', email)
          .maybeSingle();

        if (pErr) {
          console.error('[auth] erro supabase (profiles):', pErr.message);
        }

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
