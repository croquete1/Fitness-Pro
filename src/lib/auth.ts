// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabaseService';

const DBG = process.env.AUTH_DEBUG === '1';

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

        // Usa * para não falhar se alguma coluna não existir
        const { data: user, error } = await sb
          .from('users')
          .select('*')
          .or(`email.ilike.${id},username.eq.${id}`)
          .maybeSingle();

        if (DBG) console.log('[auth] found?', !!user, 'error?', !!error);
        if (error || !user) return null;

        // ===== Aprovação (flexível ao schema) =====
        const hasAnyApprovalFlag =
          'approved'   in user || 'approved_at' in user ||
          'status'     in user || 'enabled'     in user ||
          'is_active'  in user || 'isApproved'  in user;

        const status = String((user as any).status ?? '').toUpperCase();
        const approved =
          (user as any).approved === true ||
          !!(user as any).approved_at ||
          ['ACTIVE', 'APPROVED', 'ENABLED'].includes(status) ||
          (user as any).enabled === true ||
          (user as any).is_active === true ||
          (user as any).isApproved === true ||
          (!hasAnyApprovalFlag); // se não houver nenhum campo de aprovação, não bloqueia

        if (!approved) {
          if (DBG) console.log('[auth] not approved (flags present, mas false)');
          return null;
        }

        // ===== Password (hash ou legacy) =====
        const hash: string | null =
          (user as any).password_hash ?? (user as any).password ?? null;

        if (!hash) {
          if (DBG) console.log('[auth] no hash/password column present');
          return null;
        }

        const ok = await bcrypt.compare(pw, hash);
        if (!ok) {
          if (DBG) console.log('[auth] bcrypt mismatch');
          return null;
        }

        return {
          id: (user as any).id,
          name: (user as any).name ?? (user as any).username ?? (user as any).email,
          email: (user as any).email,
          image: (user as any).avatar_url ?? undefined,
          role: (user as any).role,
        } as any;
      },
    }),
  ],
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) { if (user) token.role = (user as any).role; return token; },
    async session({ session, token }) { if (session.user) (session.user as any).role = token.role; return session; },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
