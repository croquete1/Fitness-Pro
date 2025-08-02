'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

async function signup(email: string, password: string) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error || res.statusText)
  }
  return res.json()
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirm) {
      setError('As palavras-passe não coincidem.')
      return
    }

    setLoading(true)
    try {
      await signup(email, password)
      setSuccess('Conta criada com sucesso! Vais ser redirecionado…')
      setTimeout(() => signIn('credentials', { email, password }), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Registar</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-left text-sm font-medium text-gray-700">E‑mail</label>
            <input
              type="email"
              id="email"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-green-300"
              placeholder="conta@domínio.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-left text-sm font-medium text-gray-700">Palavra‑passe</label>
            <input
              type="password"
              id="password"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-green-300"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-left text-sm font-medium text-gray-700">
              Confirma a palavra‑passe
            </label>
            <input
              type="password"
              id="confirm"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-green-300"
              placeholder="••••••••"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
          >
            {loading ? 'A criar…' : 'Criar conta'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Já tens conta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
