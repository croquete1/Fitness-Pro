// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Props = {
  error?: string;
  callbackUrl?: string;
};

export default function LoginForm(props: Props) {
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const errorParam = props.error ?? sp.get("error") ?? sp.get("msg") ?? "";
  const callbackUrl = props.callbackUrl ?? sp.get("callbackUrl") ?? "/dashboard";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const mapError = (e: string | null) => {
    if (!e) return null;
    if (e === "CredentialsSignin") return "Credenciais inválidas.";
    if (e === "PENDING_APPROVAL" || e === "pending")
      return "A tua conta foi criada e aguarda aprovação do administrador.";
    return "Não foi possível iniciar sessão.";
  };

  // inicializa mensagem vinda da query string
  const initialMsg = mapError(errorParam);
  const [info] = useState(initialMsg);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl,
    });

    // se redirect=true, NextAuth tratará do redirect
    setLoading(false);
    // se algo falhar sem redirect, poderias setErr(...)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {info && <div className="rounded border p-2 text-sm">{info}</div>}
      {err && <div className="rounded border p-2 text-sm">{err}</div>}

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
        />
      </div>

      <button
        className="w-full rounded-lg border px-4 py-2 font-medium disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "A entrar..." : "Entrar"}
      </button>

      <div className="text-sm text-center">
        Ainda não tens conta?{" "}
        <Link className="underline" href="/register">
          Registar
        </Link>
      </div>
    </form>
  );
}
