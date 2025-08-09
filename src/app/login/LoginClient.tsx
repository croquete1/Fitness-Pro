"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginClient() {
  const router = useRouter();
  const { status } = useSession(); // "loading" | "authenticated" | "unauthenticated"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefetch ajuda na transição pós-login
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Usa a navegação do próprio NextAuth
      const res = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });

      // Nota: com redirect:true, normalmente `res` é `undefined` porque o browser navega.
      // Se por algum motivo não navegar, mostramos feedback:
      if (res && (res as any).error) {
        setError("Credenciais inválidas. Tente novamente.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("[login] erro:", err);
      setError("Ocorreu um erro. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border p-6">
        <h1 className="text-xl font-semibold text-center">Iniciar sessão</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm">Palavra-passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
            minLength={8}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md border px-3 py-2 hover:bg-zinc-100 disabled:opacity-60"
        >
          {submitting ? "A entrar..." : "Entrar"}
        </button>

        <div className="text-center text-sm text-gray-600">
          Ainda não tem conta?{" "}
          <Link href="/register" className="underline">Registar</Link>
        </div>
      </form>
    </main>
  );
}
