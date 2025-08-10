"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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

    if (!res) return setError("Ocorreu um erro inesperado.");
    if (res.error) return setError(res.error);

    router.push("/dashboard?tab=overview");
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow">
        <h1 className="text-2xl font-semibold">Iniciar sessão</h1>
        <label className="block">
          <span className="mb-1 block text-sm">Email</span>
          <input className="w-full rounded-lg border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Palavra‑passe</span>
          <input className="w-full rounded-lg border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-black px-4 py-2 font-medium text-white disabled:opacity-60">
          {loading ? "A entrar…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}