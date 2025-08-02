'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signIn('credentials', {
      redirect: false,
      email,
      token,
      callbackUrl: '/home',
    })

    setLoading(false)
    if (!res || res.error) {
      setError(res?.error ?? 'Erro desconhecido.')
    } else if (res.url) {
      window.location.href = res.url
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Entrar</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-left text-sm font-medium text-gray-700">E‑mail</label>
            <input
              type="email"
              id="email"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-blue-300"
              placeholder="exemplo@domínio.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="token" className="block text-left text-sm font-medium text-gray-700">
              Código enviado por e‑mail
            </label>
            <input
              type="text"
              id="token"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-blue-300"
              placeholder="123456"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {loading ? 'A carregar…' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Não tens conta?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Registar
          </Link>
        </p>
      </div>
    </div>
  )
}
