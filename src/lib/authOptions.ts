// src/lib/authOptions.ts

import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"

// Cria o cliente Supabase de servidor com service_role
// — usado apenas dentro do authorize(), que só roda no servidor (NextAuth handler)
/**
 * Nota importante:
 * - não exportes este cliente diretamente do módulo, pois isso pode falhar no build se
 *   as variáveis env não estiverem definidas em todos os ambientes.
 * - As variáveis obrigatórias são:
 *     NEXT_PUBLIC_SUPABASE_URL
 *     SUPABASE_SERVICE_ROLE_KEY
 *     NEXTAUTH_SECRET
 *   (devem estar configuradas em Development, Preview e Production)
 */
let serverSupabase: ReturnType<typeof createClient> | undefined
function getServerSupabase() {
  if (serverSupabase) return serverSupabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase URL ou Service Role Key não definidas")
  }
  serverSupabase = createClient(url, key)
  return serverSupabase
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: SupabaseAdapter({
    // o adapter lê estas env vars durante a execução na API, por isso precisam existir antes do build
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!
  }),
  providers: [
    CredentialsProvider({
      name: "Email e Senha",
      credentials: {
        email: { label: "E‑mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email e senha são obrigatórios")
        }

        const supabase = getServerSupabase()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password
        })
        if (error || !data.user) {
          throw new Error("Email ou senha inválidos")
        }

        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.email!
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        ;(session.user as any).id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login?error=1"
  }
}

// Exporta o handler para rota App Router em:
// src/app/api/auth/[...nextauth]/route.ts:
//    export { handler as GET, handler as POST } from "@/lib/authOptions.ts"
export default NextAuth(authOptions)
