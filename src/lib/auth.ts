// src/lib/auth.ts
import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type AnyRole = 'ADMIN' | 'PT' | 'TRAINER' | 'CLIENT' | string | undefined;

const normEmail = (v?: string | null) => String(v ?? '').trim().toLowerCase();
const toAppRole = (v?: AnyRole): 'ADMIN' | 'PT' | 'CLIENT' => {
  const r = String(v ?? '').toUpperCase();
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'PT' || r === 'TRAINER') return 'PT';
  return 'CLIENT';
};
const supabaseAnon = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, anon, { auth: { persistSession: false } });
};

/**
 * Lê APENAS de `public.users` usando SERVICE ROLE.
 * Não assume nomes de colunas — usa `select('*')` e mapeia com tolerância:
 * - role: role | user_role | account_type
 * - status: status | (approved/is_active inferidos)
 * - hash: password_hash | passwordHash | hash | password
 */
async function getLocalUserByEmail(email: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[auth] SERVICE_ROLE_KEY ausente — lookup local desativado.');
    return null;
  }
  const sb = supabaseAdmin();
  try {
    const { data, error } = await sb
      .from('users' as any)
      .select('*')
      .ilike('email', email)
      .limit(1);
    if (error) {
      console.warn('[auth] falha a ler users:', error.message);
      return null;
    }
    const row = (data?.[0] ?? null) as any;
    if (!row) return null;

    const role = row.role ?? row.user_role ?? row.account_type ?? undefined;
    const approved = row.approved ?? null;
    const isActive = row.is_active ?? row.isActive ?? null;

    const status =
      (row.status ? String(row.status).toUpperCase() : '') ||
      (approved === false ? 'PENDING' : '') ||
      (isActive === false ? 'SUSPENDED' : '') ||
      'ACTIVE';

    const passwordHash: string | null =
      row.password_hash ?? row.passwordHash ?? row.hash ?? row.password ?? null;

    return {
      id: String(row.id),
      email: String(row.email ?? email),
      name: row.name ? String(row.name) : null,
      role: toAppRole(role),
      status,
      passwordHash,
    };
  } catch (e: any) {
    console.warn('[auth] exceção a ler users:', e?.message || e);
    return null;
  }
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
        const email = normEmail(credentials?.email);
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;

        // 1) LOCAL (bcrypt) — robusto e com logs claros
        try {
          const local = await getLocalUserByEmail(email);
          if (local?.passwordHash) {
            // suporta bcrypt e “hashes acidentais” (evita crash se for algo não-bcrypt)
            const looksBcrypt = /^\$2[aby]?\$/.test(local.passwordHash);
            if (looksBcrypt) {
              const ok = await bcrypt.compare(password, local.passwordHash);
              if (ok) {
                console.log('[auth] login LOCAL OK para', email);
                const user: User = { id: local.id, name: local.name ?? undefined, email: local.email } as User;
                (user as any).role = local.role;
                return user;
              } else {
                console.warn('[auth] password incorreta (LOCAL) para', email);
              }
            } else {
              // fallback de segurança: se alguém guardou “hash” errado (plain/md5), nunca autenticar
              const md5 = createHash('md5').update(password).digest('hex');
              if (local.passwordHash === md5) {
                console.warn('[auth] hash MD5 detectado — por segurança NÃO autenticamos. Atualiza para bcrypt.');
              } else {
                console.warn('[auth] hash local não-bcrypt — ignorado.');
              }
            }
          } else {
            console.warn('[auth] sem password_hash LOCAL para', email);
          }
        } catch (e: any) {
          console.error('[auth] erro LOCAL:', e?.message || e);
        }

        // 2) SUPABASE AUTH (fallback)
        try {
          const sb = supabaseAnon();
          const { data, error } = await sb.auth.signInWithPassword({ email, password });
          if (!error && data?.user) {
            console.log('[auth] login SUPABASE OK para', email);
            const meta = await getLocalUserByEmail(email);
            const user: User = {
              id: data.user.id,
              name: data.user.user_metadata?.name ?? meta?.name ?? data.user.email ?? undefined,
              email: data.user.email ?? email,
            } as User;
            (user as any).role = meta?.role ?? 'CLIENT';
            return user;
          } else {
            console.warn('[auth] SUPABASE rejeitou credenciais para', email, '-', error?.message);
          }
        } catch (e: any) {
          console.error('[auth] erro SUPABASE:', e?.message || e);
        }

        // 3) Falhou
        console.warn('[auth] LOGIN FALHOU para', email);
        return null;
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { (token as any).id = (user as any).id; (token as any).role = (user as any).role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = (token as any).id; (session.user as any).role = (token as any).role; }
      return session;
    },
  },
};
export const authConfig = authOptions;
