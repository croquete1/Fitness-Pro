// **src/lib/authOptions.ts**

import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET

if (!SUPA_URL || !SUPA_SERVICE_KEY || !NEXTAUTH_SECRET) {
  throw new Error(
    "[authOptions] Environment variables missing: SUPA_URL | SERVICE_ROLE_KEY | NEXTAUTH_SECRET"
  )
}

const supabaseAdmin = createClient(SUPA_URL, SUPA_SERVICE_KEY)

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  adapter: SupabaseAdapter({ url: SUPA_URL, secret: SUPA_SERVICE_KEY }),
  pages: {
    signIn: "/login",
    error: "/login?error=1",
  },
  providers: [
    CredentialsProvider({
      name: "Email / Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // autenticação via supabase.auth.signInWithPassword
      authorize: async ({ email, password }) => {
        if (!email || !password) {
          throw new Error("Email e password são obrigatórios.")
        }
        const { data, error } =
          await supabaseAdmin.auth.signInWithPassword({ email, password })
        if (error || !data.user) {
          throw new Error(error?.message || "Falha no login.")
        }
        return { id: data.user.id, email: data.user.email!, name: data.user.email! }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // guarda id no token (chave "id") se for login novo
      if (user) {
        token.id = (user as Promise<{ id: string }> & any)?.id!
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // atribui o ID (necessário para RBAC ou perfis)
        session.user.id = token.id as string

        // pega o role da tabela “profiles” (caso exista)
        const { data: profile, error } = await supabaseAdmin
          .from("profiles")
          .select("role")
          .eq("id", token.id)
          .single()
        if (!error && profile && profile.role) {
          ;(session.user as any).role = profile.role
        }
      }
      return session
    },
  },
}

export type AuthOptionsType = typeof authOptions
