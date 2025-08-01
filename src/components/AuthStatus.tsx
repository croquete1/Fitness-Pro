// src/components/AuthStatus.tsx
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

export default async function AuthStatus(): Promise<{
  session: Awaited<ReturnType<typeof getServerSession>> | null
  status: SessionStatus
}> {
  const session = await getServerSession(authOptions)
  const status =
    session === undefined
      ? 'loading'
      : session
      ? 'authenticated'
      : 'unauthenticated'
  return { session, status }
}
