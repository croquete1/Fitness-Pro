// src/lib/authOptions.ts
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"

// initialize a Supabase client for adapter + auth calls
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: "Email / Password (magic link)",
      credentials: {
        email: { label: "E-mail", type: "email" },
        token: { label: "Token", type: "text" },
      },
      authorize: async (credentials) => {
        const { data, error } = await supabase.auth.verifyOtp({
          email: credentials!.email,
          token: credentials!.token,
          type: "magiclink",
        })
        if (error || !data?.user) return null
        return { id: data.user.id, email: data.user.email! }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login?error",
  },
}
