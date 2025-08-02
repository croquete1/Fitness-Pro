// src/lib/authOptions.ts

/**
 * ATENÇÃO: NÃO FAZER NADA QUE DEPENDA DE `process.env...` NO TOPO DO ARQUIVO
 * para evitar falhas durante o static generation de rotas como `_not-found`
 * no Vercel (relacionado ao erro: "supabaseUrl is required").
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";

export const authOptions: NextAuthOptions = {
  /**
   * → Se `NEXTAUTH_SECRET` estiver definido em .env, NextAuth o usará automaticamente
   * → gerar sessão JWT (não usaremos database fallback do Supabase)
   */
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email & Senha",
      credentials: {
        email: { label: "E‑mail", type: "email", placeholder: "teu@exemplo.com" },
        password: {
          label: "Senha",
          type: "password",
          placeholder: "••••••••",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          throw new Error("É necessário informar e‑mail e senha.");
        }

        const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!SUPA_URL || !SUPA_SERVICE_KEY) {
          // Garante que serve apenas para login em ambiente configurado
          throw new Error("Autenticação não configurada corretamente.");
        }

        const { createClient } = await import("@supabase/supabase-js");

        const supabaseAdmin = createClient(SUPA_URL, SUPA_SERVICE_KEY);

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error || !data.user) {
          throw new Error(error?.message ?? "Falha ao efetuar login.");
        }

        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.email!,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        (token as any).id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Copia o ID para session.user.id — usado no Sidebar e protected routes
      if (session.user && (token as any).id) {
        (session.user as any).id = (token as any).id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=1",
  },
};

/** Se e só se as env vars estiverem definidas, adiciona o adapter do Supabase */
if (
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL
) {
  authOptions.adapter = SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
