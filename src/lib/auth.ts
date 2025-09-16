// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase.server';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email ou username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? '').trim();
        const password = String(credentials?.password ?? '');

        if (!identifier || !password) return null;

        const s = supabaseAdmin();
        const isEmail = identifier.includes('@');
        let row: any = null;

        if (isEmail) {
          const { data } = await s
            .from('users')
            .select('id,email,name,role,status,password_hash,username')
            .ilike('email', identifier) // case-insensitive
            .maybeSingle();
          row = data ?? null;
        } else {
          const idLower = identifier.toLowerCase();
          const { data } = await s
            .from('users')
            .select('id,email,name,role,status,password_hash,username,username_lower')
            .eq('username_lower', idLower)
            .maybeSingle();
          row = data ?? null;
        }

        if (!row) return null;
        if (row.status && row.status !== 'ACTIVE') return null;

        const ok = !!row.password_hash && (await bcrypt.compare(password, row.password_hash));
        if (!ok) return null;

        return {
          id: row.id,
          email: row.email,
          name: row.name ?? null,
          role: row.role ?? 'CLIENT',
          username: row.username ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? token.role;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        (token as any).username = (user as any).username ?? (token as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      (session.user as any).id = (token as any).id;
      (session.user as any).role = (token as any).role;
      (session.user as any).username = (token as any).username ?? null;
      return session;
    },
  },

  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

// compat
export const authConfig = authOptions;
