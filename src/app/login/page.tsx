// src/app/login/page.tsx
"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const justRegistered = params.get("registered")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      // aqui chamas a tua API de login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded shadow space-y-6"
      >
        <h2 className="text-2xl font-bold">Login</h2>
        {justRegistered && (
          <div className="bg-green-100 text-green-800 p-2 rounded">
            Conta criada com sucesso! Faça o login.
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
        <p className="text-sm text-center">
          Ainda não tens conta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Registar‑te
          </Link>
        </p>
      </form>
    </div>
  )
}
