// src/components/AuthStatus.tsx
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/[...nextauth]/route'

export default async function AuthStatus() {
  const session = await getServerSession({ cookies }, authOptions)
  return { status: session ? 'authenticated' : 'unauthenticated' }
}
