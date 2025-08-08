"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setBusy(false);
    if (res.ok) router.push("/login");
    else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Erro ao registar.");
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 rounded-xl border p-6">
        <h1 className="text-xl font-semibold text-center">Criar conta</h1>
        <input className="w-full rounded-md border px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome" required />
        <input className="w-full rounded-md border px-3 py-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input className="w-full rounded-md border px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Palavra-passe (≥8)" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-md border bg-card px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60">
          {busy ? "A criar…" : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
