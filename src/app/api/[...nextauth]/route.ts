// src/app/api/[...nextauth]/route.ts
import NextAuth from 'next-auth/next'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'

// Aqui você não precisa importar o client supabase padrão,
// pois o adapter vai criar o client internamente usando as credenciais.
const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Token de Acesso', type: 'text' },
      },
      authorize: async (credentials) => {
        // Exemplo usando magic link/token via Supabase
        const { cookies } = require('next/headers');
        const { data, error } = await (
          await import('@supabase/auth-helpers-nextjs')
        ).createServerComponentClient({ cookies: cookies() }).auth.verifyOtp({
          email: credentials!.email,
          token: credentials!.password,
          type: 'magiclink',
        })
        if (error || !data?.user) return null
        return { id: data.user.id, name: data.user.email }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login?error',
  },
}

// Cria o handler NextAuth
const handler = NextAuth(authOptions)

// Exporta apenas os métodos HTTP esperados
export { handler as GET, handler as POST }
