// src/lib/auth.ts
import type { NextAuthOptions, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabasePublic, createServerClient } from '@/lib/supabaseServer';
import { toAppRole, toDbRole } from '@/lib/roles';

type DbUser = {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
};

function homeFor(role?: string) {
  const r = (role ?? '').toUpperCase();
  if (r === 'ADMIN') return '/dashboard/admin';
  if (r === 'PT' || r === 'TRAINER') return '/dashboard/pt';
  return '/dashboard/clients';
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret',
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase();
        const password = String(credentials?.password ?? '');

        if (!email || !password) return null;

        // 1) Verifica credenciais no Supabase Auth
        const sb = supabasePublic();
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error || !data?.user) {
          // Credenciais inválidas
          return null;
        }

        // 2) Busca o utilizador na nossa tabela pública `users` para role/status
        const sba = createServerClient(); // admin/service role
        const { data: rows, error: qErr } = await sba
          .from('users')
          .select('id,name,email,role,status')
          .eq('email', email)
          .limit(1);

        if (qErr || !rows || rows.length === 0) {
          // Sem registo paralelo -> bloquear login (UX: pedir contacto ao suporte)
          throw new Error('ACCOUNT_NOT_LINKED');
        }

        const u: DbUser = rows[0] as DbUser;

        // 3) Regras de estado/role
        if (u.status === 'PENDING') throw new Error('APPROVAL_REQUIRED');
        if (u.status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');

        const appRole = toAppRole(u.role) ?? 'CLIENT';

        const user: User = {
          id: String(u.id),
          name: u.name ?? undefined,
          email: u.email,
          // @ts-expect-error — guardamos também role no objeto para callbacks
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
      // Quando há login, “merge” role/id no token
      if (user) {
        token.id = (user as any).id ?? token.id;
        token.role = (user as any).role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expor id/role na sessão
      if (session.user) {
        (session.user as any).id = token.id ?? (session.user as any).id;
        (session.user as any).role = token.role ?? (session.user as any).role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Normaliza redirect pós-login
      try {
        const u = new URL(url, baseUrl);
        // Mantemos callbackUrl se existir
        if (u.searchParams.get('callbackUrl')) return u.toString();
      } catch {}
      // Por omissão não forçamos nada aqui (o cliente decide).
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};

// Compat com código que importa `authConfig`
export const authConfig = authOptions;
