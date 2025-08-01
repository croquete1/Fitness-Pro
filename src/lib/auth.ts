// src/lib/auth.ts
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/app/api/[...nextauth]/route'

/**
 * Helper para obter a sessão no Server Component
 */
export async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}
