"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setSubmitting(false);

    if (!res) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
      return;
    }

    if (res.ok) {
      router.push(callbackUrl);
    } else {
      // NextAuth retorna "CredentialsSignin" geralmente para credenciais inválidas
      setError("Credenciais inválidas. Verifique o email e a palavra-passe.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="exemplo@dominio.com"
          autoComplete="email"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm">Palavra-passe</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </label>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md border px-3 py-2 font-medium disabled:opacity-60"
      >
        {submitting ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
