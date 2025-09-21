// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabaseServer';

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credenciais',
      credentials: {
        emailOrUsername: { label: 'Email ou username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const emailOrUsername = credentials?.emailOrUsername?.trim() ?? '';
        const password = credentials?.password ?? '';
        if (!emailOrUsername || !password) return null;

        const sb = createServerClient();

        // procurar por email (case-insensitive) OU username
        const { data: user, error } = await sb
          .from('users')
          .select('id, name, email, username, role, approved, password_hash, avatar_url')
          .or(`email.ilike.${emailOrUsername},username.eq.${emailOrUsername}`)
          .maybeSingle();

        if (error || !user) return null;

        // conta ainda não aprovada
        if (!Boolean(user.approved)) {
          throw new Error('PENDING_APPROVAL');
        }

        // comparar password
        const ok = user.password_hash
          ? await bcrypt.compare(password, user.password_hash)
          : false;

        if (!ok) return null;

        return {
          id: user.id,
          name: user.name ?? user.username ?? user.email,
          email: user.email,
          image: user.avatar_url ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
