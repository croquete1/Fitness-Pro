// src/lib/auth.ts
import { getServerSession } from "next-auth/next"
import type { NextAuthOptions, Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente Supabase com service-role (use apenas no server)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

/**
 * Configurações do NextAuth
 */
export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceRoleKey,
  }),
  providers: [
    CredentialsProvider({
      name: "Email & Token",
      credentials: {
        email: { label: "E-mail", type: "email" },
        token: { label: "Token", type: "text" },
      },
      authorize: async (credentials) => {
        // exemplo de verificação com Supabase Magic Link / OTP
        const { data, error } = await supabase.auth.verifyOtp({
          email: credentials!.email,
          token: credentials!.token,
          type: "magiclink",
        })
        if (error || !data?.user) return null
        return { id: data.user.id, email: data.user.email }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login?error",
  },
}

/**
 * Helper para obter a sessão dentro de componentes Server
 */
export async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}
