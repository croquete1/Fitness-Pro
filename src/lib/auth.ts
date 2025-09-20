// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { createServerClient } from '@/lib/supabaseServer';

export const authOptions: NextAuthOptions = {
  // mantém o que já tinhas aqui (pages, theme, etc. se usares)
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },

  providers: [
    Credentials({
      name: 'Credenciais',
      credentials: {
        emailOrUsername: { label: 'Email ou username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const sb = createServerClient();
        const loginKey = credentials.emailOrUsername.trim();

        // Ajusta os campos conforme a tua tabela "users"
        const { data: u } = await sb
          .from('users')
          .select('id,email,name,role,approved,password_hash,avatar_url,username')
          .or(`email.eq.${loginKey},username.eq.${loginKey}`)
          .maybeSingle();

        if (!u) return null;

        const ok = await compare(credentials.password, (u as any).password_hash ?? '');
        if (!ok) return null;

        if ((u as any).approved === false) {
          // devolve erro legível para o /login (?error=PENDING_APPROVAL)
          throw new Error('PENDING_APPROVAL');
        }

        // devolve os dados que queres injectar no JWT
        return {
          id: u.id,
          name: u.name ?? u.username ?? u.email,
          email: u.email,
          role: u.role,
          approved: true,
          avatar_url: (u as any).avatar_url ?? null,
          username: (u as any).username ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.approved = (user as any).approved ?? true;
        token.avatar_url = (user as any).avatar_url ?? null;
        token.username = (user as any).username ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).approved = token.approved;
      (session.user as any).avatar_url = token.avatar_url;
      (session.user as any).username = token.username;
      return session;
    },
    // (opcional) redirect({ url, baseUrl }) { ... }
  },
};
