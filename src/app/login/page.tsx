"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const router                  = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await signIn("credentials", {
      redirect: false,
      email, password,
    })

    if (res?.error) {
      setError("Credenciais inválidas")
    } else {
      router.replace("/") // ou rota após login
    }
  }

  return (
    <main>
      <h1>Entrar com Email e Senha</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
          />
        </label>
        <label>
          Senha
          <input
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
          />
        </label>
        <button type="submit">Entrar</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </main>
  )
}
