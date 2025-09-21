// src/lib/auth.ts
import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type AnyRole = 'ADMIN' | 'PT' | 'TRAINER' | 'CLIENT' | string | undefined;

function normalizeEmail(v?: string | null) {
  return String(v ?? '').trim().toLowerCase();
}
function roleToApp(value?: AnyRole): 'ADMIN' | 'PT' | 'CLIENT' {
  const r = String(value ?? '').toUpperCase();
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'PT' || r === 'TRAINER') return 'PT';
  return 'CLIENT';
}
function supabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, anon, { auth: { persistSession: false } });
}

/** Lê utilizador nas tabelas locais com service role (independente do contexto da request) */
async function getLocalUserByEmail(email: string) {
  const sb = supabaseAdmin();

  const selectCols =
    'id, email, name, role, status, user_role, account_type, approved, is_active, password_hash';

  async function tryTable(table: string) {
    const { data, error } = await sb.from(table as any)
      .select(selectCols)
      .ilike('email', email)
      .limit(1);
    if (error) return null;
    return data?.[0] ?? null;
  }

  let row =
    (await tryTable('users')) ??
    (await tryTable('profiles')) ??
    (await tryTable('user_profiles'));

  if (!row) return null;

  const role = row.role ?? row.user_role ?? row.account_type ?? undefined;
  const statusRaw =
    String(row.status ?? '').toUpperCase() ||
    (row.approved === false ? 'PENDING' : '') ||
    (row.is_active === false ? 'SUSPENDED' : '') ||
    'ACTIVE';

  return {
    id: String(row.id),
    email: row.email as string,
    name: (row.name as string) ?? null,
    role: roleToApp(role),
    status: statusRaw,
    passwordHash: (row as any).password_hash as string | null,
  };
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

        // 1) Autenticação LOCAL (bcrypt) com service role
        let local: Awaited<ReturnType<typeof getLocalUserByEmail>> | null = null;
        try {
          local = await getLocalUserByEmail(email);
          if (local?.passwordHash) {
            const ok = await bcrypt.compare(password, local.passwordHash);
            if (ok) {
              const user: User = {
                id: local.id,
                name: local.name ?? undefined,
                email: local.email,
                // @ts-expect-error role no user para callbacks
                role: local.role,
              };
              return user;
            }
          }
        } catch {
          // ignora e tenta Supabase Auth
        }

        // 2) Fallback: Supabase Auth (para quem foi criado no Auth)
        try {
          const sb = supabaseAnon();
          const { data, error } = await sb.auth.signInWithPassword({ email, password });
          if (!error && data?.user) {
            // tenta complementar meta local (role/nome) se existir
            const meta = local ?? (await getLocalUserByEmail(email)) ?? undefined;
            const user: User = {
              id: data.user.id,
              name: data.user.user_metadata?.name ?? meta?.name ?? data.user.email ?? undefined,
              email: data.user.email ?? email,
              // @ts-expect-error role para callbacks
              role: meta?.role ?? 'CLIENT',
            };
            return user;
          }
        } catch {
          // ignore
        }

        // 3) Nenhum método validou
        return null;
      },
    }),
  ],
  pages: { signIn: '/login' },
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

// alias
export const authConfig = authOptions;
