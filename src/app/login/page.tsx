// /src/app/login/page.tsx
"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn("credentials", {
      redirect: true, // ou false se queres controlar navegação manual
      email,
      password,
      callbackUrl: "/dashboard" // para onde redirecionar após login
    })
    if (res?.error) setError("Login inválido")
  }

  return (
    <form onSubmit={handleSubmit} className="...">
      {/* ... */}
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Entrar</button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
