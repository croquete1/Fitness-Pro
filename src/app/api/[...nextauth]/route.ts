// src/app/api/[...nextauth]/route.ts
import NextAuth from 'next-auth/next'
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
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { data, error } = await supabase.auth.verifyOtp({
          email: credentials!.email,
          token: credentials!.password,
          type: 'magiclink',
        })
        if (error || !data?.user) return null
        return { id: data.user.id, email: data.user.email, role: data.user.role }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = (user as any).role
      return token
    },
    session: async ({ session, token }) => {
      session.user = { ...(session.user as any), role: token.role }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=1',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
