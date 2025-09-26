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
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 1) obter hash
        const { data: cred } = await supabaseAdmin
          .from('auth_local_users')
          .select('id, email, password_hash')
          .eq('email', email)
          .maybeSingle();
        if (!cred) return null;

        // 2) comparar
        const ok = await checkPassword(password, cred.password_hash);
        if (!ok) return null;

        // 3) perfil / role
        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('name, role')
          .eq('email', email)
          .maybeSingle();

        return {
          id: cred.id,
          email: cred.email,
          name: prof?.name ?? cred.email.split('@')[0],
          role: prof?.role ?? 'CLIENT',
        } as any;
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

  // secret lido de process.env.NEXTAUTH_SECRET
};
