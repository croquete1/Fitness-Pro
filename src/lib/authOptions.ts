// src/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: 'Magic link (email)',
      credentials: {
        email: { label: 'E‑mail', type: 'email' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        // Import only when needed, avoiding module-level import
        const { createClient } = await import('@supabase/supabase-js')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const client = createClient(url, key)
        const { data, error } = await client.auth.verifyOtp({
          email: credentials?.email!,
          token: credentials?.token!,
          type: 'magiclink',
        })
        if (error || !data.user) return null
        return { id: data.user.id, email: data.user.email || '' }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id
      return token
    },
    session: async ({ session, token }) => {
      session.user = {...session.user!, id: token.id as string }
      return session
    },
  },
}
