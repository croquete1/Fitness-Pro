// src/lib/auth.ts
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import NextAuth from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

/**
 * Helper para obter a sessão no Server Component
 */
export async function getAuthSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  return session
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
