'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

type LoginFormProps = {
  error?: string | null
  callbackUrl?: string | null
}

export default function LoginForm({ error: initialError, callbackUrl }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(initialError ?? null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Usa o callbackUrl se vier da query, senão cai no /dashboard
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: callbackUrl ?? '/dashboard',
    })

    setSubmitting(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded px-4 py-2 border bg-black text-white disabled:opacity-60"
      >
        {submitting ? 'A entrar…' : 'Entrar'}
      </button>
    </form>
  )
}
