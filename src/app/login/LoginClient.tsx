'use client'

import { useSearchParams } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ?? undefined
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined

  return (
    <div className="w-full max-w-md">
      <LoginForm error={error} callbackUrl={callbackUrl} />
    </div>
  )
}
