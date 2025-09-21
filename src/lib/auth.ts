import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabaseService';

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
        const id = credentials?.emailOrUsername?.trim() ?? '';
        const pw = credentials?.password ?? '';
        if (!id || pw.length < 6) return null;

        const sb = createServiceClient();

        // login por email (case-insensitive) OU username exacto
        const byEmail = id.includes('@');

        const { data: user, error } = await sb
          .from('users')
          .select('id,name,email,username,role,approved,password_hash,avatar_url')
          .eq(byEmail ? 'email' : 'username', byEmail ? id.toLowerCase() : id)
          .maybeSingle();

        if (error || !user) return null;
        if (!user.approved) {
          // conta criada mas ainda pendente (mantemos 401 genérico para não revelar estado)
          return null;
        }

        const ok = user.password_hash ? await bcrypt.compare(pw, user.password_hash) : false;
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
