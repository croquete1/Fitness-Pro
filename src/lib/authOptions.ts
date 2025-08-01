// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"

// Inicializa o cliente Supabase com URL pública e chave service role para uso no servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  }),
  providers: [
    CredentialsProvider({
      name: "E‑mail (Magic Link)",
      credentials: {
        email: { label: "E‑mail", type: "email" },
        token: { label: "Token", type: "text" },
      },
      authorize: async (credentials) => {
        const { data, error } = await supabase.auth.verifyOtp({
          email: credentials?.email as string,
          token: credentials?.token as string,
          type: "magiclink",
        })
        if (error || !data?.user) return null
        return {
          id: data.user.id,
          email: data.user.email as string,
          name: data.user.email as string,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login?error=1",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        id: token.id as string,
      }
      return session
    },
  },
}
