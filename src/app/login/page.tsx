// src/app/(public)/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded shadow"
      >
        <h1 className="text-2xl mb-4">Login</h1>
        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
        )}
        <label className="block mb-2">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-700">Senha</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
