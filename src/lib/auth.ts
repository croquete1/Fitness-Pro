// src/lib/auth.ts
import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type DbUser = {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'PT' | 'CLIENT' | string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | string;
};

function normalizeEmail(v?: string | null) {
  return String(v ?? '').trim().toLowerCase();
}

function supabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, anon, { auth: { persistSession: false } });
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;

        // 1) Validar credenciais no Supabase Auth (anon client)
        const sb = supabaseAnon();
        const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
        if (signInErr || !signInData?.user) return null;

        // 2) Ler utilizador na nossa tabela (role/status) via service/server client
        const sba = createServerClient();
        const { data: rows, error: qErr } = await sba
          .from('users')
          .select('id,name,email,role,status')
          .ilike('email', email)
          .limit(1);

        if (qErr) throw new Error('INTERNAL_ERROR');
        if (!rows || rows.length === 0) throw new Error('ACCOUNT_NOT_LINKED');

        const u = rows[0] as DbUser;

        // 3) Regras de estado
        const status = String(u.status ?? '').toUpperCase();
        if (status === 'PENDING') throw new Error('APPROVAL_REQUIRED');
        if (status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');

        // 4) Mapear role para app
        const appRole = toAppRole(u.role) ?? 'CLIENT';

        const user: User = {
          id: String(u.id),
          name: u.name ?? undefined,
          email: u.email,
          // @ts-expect-error — guardamos role no user para callbacks
          role: appRole,
        };
        return user;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id ?? (token as any).id;
        (token as any).role = (user as any).role ?? (token as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id ?? (session.user as any).id;
        (session.user as any).role = (token as any).role ?? (session.user as any).role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        if (u.origin === baseUrl) return u.toString();
      } catch {}
      return baseUrl;
    },
  },
};

// Alias usado noutros pontos do projeto
export const authConfig = authOptions;
