import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import { supabase } from '@/lib/supabaseClient'

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: 'E‑mail (Magic link)',
      credentials: {
        email: { label: 'E‑mail', type: 'email' },
        token: { label: 'Token', type: 'text' },
      },
      authorize: async (credentials) => {
        const { data, error } = await supabase.auth.verifyOtp({
          email: credentials!.email!,
          token: credentials!.token!,
          type: 'magiclink',
        })
        if (error || !data?.user) return null
        return { id: data.user.id, email: data.user.email! }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login?error=1' },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id as string
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user = { ...session.user, id: token.id as string }
      return session
    },
  },
}
