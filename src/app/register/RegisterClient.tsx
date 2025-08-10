// src/app/register/RegisterClient.tsx
"use client";

import { useState } from "react";

export default function RegisterClient() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const data = new FormData(e.currentTarget);
      const body = {
        name: (data.get("name") as string) ?? "",
        email: (data.get("email") as string) ?? "",
        password: (data.get("password") as string) ?? "",
      };

      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Falha no registo");

      setOk(true);
    } catch (e: any) {
      setErr(e?.message ?? "Falha no registo");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Pedido enviado</h2>
        <p>
          A sua conta foi criada com estado <b>PENDENTE</b>. Um administrador irá
          aprovar e receberá notificação por email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm">Nome</label>
        <input name="name" className="w-full rounded border p-2" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Email</label>
        <input name="email" type="email" required className="w-full rounded border p-2" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Password</label>
        <input name="password" type="password" required className="w-full rounded border p-2" />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "A registar..." : "Criar conta"}
      </button>
    </form>
  );
}
