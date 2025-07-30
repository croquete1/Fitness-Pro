// src/app/register/page.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"client"|"trainer">("client")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password, role }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push("/login?registered=1")
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
        <h2 className="text-2xl font-bold">Registar‑te</h2>
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
        <div>
          <label className="block text-sm font-medium">Tipo de Conta</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as any)}
            className="mt-1 block w-full border-gray-300 rounded p-2"
          >
            <option value="client">Cliente</option>
            <option value="trainer">Personal Trainer</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Criar Conta
        </button>
      </form>
    </div>
  )
}
