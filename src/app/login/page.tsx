"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// (Opcional) Evita SSG desta página durante o build. Mantemos também o Suspense,
// pois é a recomendação oficial quando se usa useSearchParams em Client Components.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh grid place-items-center p-6">
          <div className="w-full max-w-sm rounded-xl border p-6 space-y-4">
            <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const { status } = useSession(); // 'loading' | 'authenticated' | 'unauthenticated'
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // flag para evitar múltiplos redirects
  const hasRedirected = useRef(false);

  // Se já estiver autenticado, redireciona uma única vez
  useEffect(() => {
    if (status === "authenticated" && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Mensagem de erro vinda de query (ex.: callback do NextAuth)
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError("Falha na autenticação. Tente novamente.");
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Importante: redirect: false para controlarmos a navegação e evitar loops
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (res?.error) {
      setError("Credenciais inválidas.");
      return;
    }
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/dashboard");
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
