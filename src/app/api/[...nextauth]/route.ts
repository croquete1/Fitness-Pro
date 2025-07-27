// src/app/api/[...nextauth]/route.ts

import NextAuth from 'next-auth/next'
import type { NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { Session, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import { supabase } from '../../../lib/supabaseClient'

const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: 'Email e Senha',
      credentials: {
        email:    { label: 'Email',    type: 'email',    placeholder: 'vc@exemplo.com' },
        password: { label: 'Senha',    type: 'password' },
      },
      async authorize(credentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials?.email!,
          password: credentials?.password!,
        })

        if (error || !data.user) return null

        return {
          id:    data.user.id,
          email: data.user.email!,
          name:  data.user.user_metadata.name || undefined,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) token.user = user
      return token
    },
    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT & { user?: User }
    }): Promise<Session> {
      session.user = token.user
      return session
    },
  },
}

// NOTE: importa NextAuth de 'next-auth/next' e passa apenas o authOptions.
// Não use dois argumentos — o App Router internamente cuida de req/res.
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
