"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setBusy(false);
    if (res?.ok) router.push("/");
    else setError("Credenciais inválidas.");
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 rounded-xl border p-6">
        <h1 className="text-xl font-semibold text-center">Iniciar sessão</h1>
        <input
          className="w-full rounded-md border px-3 py-2"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="o.seu@email.com"
          required
          autoComplete="email"
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Palavra-passe"
          required
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-md border bg-card px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "A entrar…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
