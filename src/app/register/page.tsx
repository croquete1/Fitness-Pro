// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callback = sp.get("callbackUrl") ?? "/login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Erro no registo");
        return;
      }

      setOk(true);
      // Redireciona para login com info de pendente
      setTimeout(() => {
        router.push(`/login?msg=pending&callbackUrl=${encodeURIComponent(callback)}`);
      }, 1200);
    } catch {
      setError("Erro de rede. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl border p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Criar conta</h1>

        {ok ? (
          <div className="rounded-lg border p-3 text-sm">
            Conta criada! Aguarda aprovação do administrador antes de iniciar sessão.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm">Nome</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <input
                className="w-full rounded border px-3 py-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="o.teu@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm">Password</label>
              <input
                className="w-full rounded border px-3 py-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="mín. 6 caracteres"
              />
            </div>

            {!!error && (
              <div className="rounded border p-2 text-sm">{error}</div>
            )}

            <button
              className="w-full rounded-lg border px-4 py-2 font-medium disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "A criar..." : "Criar conta"}
            </button>
          </form>
        )}

        <div className="text-sm">
          Já tens conta?{" "}
          <Link className="underline" href={`/login?callbackUrl=${encodeURIComponent(callback)}`}>
            Inicia sessão
          </Link>
        </div>
      </div>
    </div>
  );
}
