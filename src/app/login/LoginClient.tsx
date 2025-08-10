"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard?tab=overview",
    });

    setLoading(false);

    if (!res) return setError("Erro inesperado.");

    if (res.error) {
      // NextAuth devolve normalmente "CredentialsSignin" em erros de credenciais
      if (res.error === "CredentialsSignin" || res.error === "invalid_credentials") {
        return setError("Email ou password incorretos.");
      }
      if (res.error === "missing_credentials") {
        return setError("Preencha email e password.");
      }
      return setError("Falha ao iniciar sessão.");
    }

    router.push("/dashboard?tab=overview");
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border p-6 shadow">
        <h1 className="text-xl font-semibold text-center">Iniciar sessão</h1>

        <label className="block">
          <span className="mb-1 block text-sm">Email</span>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">Password</span>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-2 font-medium text-white disabled:opacity-60"
          aria-busy={loading}
        >
          {loading ? "A entrar…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
