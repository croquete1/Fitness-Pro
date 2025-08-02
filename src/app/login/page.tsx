// src/app/login/page.tsx
"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard"
    })
    setLoading(false)
    if (res?.error) setError("E-mail ou password inválidos")
    if (res?.ok && res.url) window.location.href = res.url
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">Iniciar Sessão</h1>
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-1">E-mail</label>
          <input
            id="email"
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-100"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 mb-1">Palavra-passe</label>
          <input
            id="password"
            type="password"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-red-600 text-center">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold transition"
          disabled={loading}
        >
          {loading ? "A entrar..." : "Entrar"}
        </button>
        <div className="text-center">
          <a href="/register" className="text-sm text-blue-600 hover:underline">Criar nova conta</a>
        </div>
      </form>
    </div>
  )
}
