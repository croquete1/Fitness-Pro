import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { supabase } from "./supabaseClient";

export const authOptions: NextAuthOptions = {
  // obrigatório em produção
  secret: process.env.NEXTAUTH_SECRET,
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!
  }),
  providers: [
    CredentialsProvider({
      name: "Email e senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      authorize: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return null;
        return {
          id: data.user.id,
          name: data.user.email || undefined,
          email: data.user.email || undefined
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => { if (user) token.id = user.id; return token; },
    session: async ({ session, token }) => {
      (session.user as any).id = token.id;
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login?error"  // mostra alert conforme query param
  }
};
