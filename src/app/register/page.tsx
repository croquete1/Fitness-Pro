"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh grid place-items-center p-6">
          <div className="w-full max-w-sm rounded-xl border p-6 space-y-4">
            <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { status } = useSession();
  const hasRedirected = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se já autenticado, redireciona uma única vez
  useEffect(() => {
    if (status === "authenticated" && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/dashboard");
    }
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.status === 409) {
        setSubmitting(false);
        setError("Este email já está registado.");
        return;
      }
      if (!res.ok) {
        setSubmitting(false);
        setError("Falha no registo. Tente novamente.");
        return;
      }

      // Login automático após registo
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false, // controlamos a navegação
      });

      setSubmitting(false);

      if (login?.error) {
        // Caso raro: regista mas não autentica — envia para login
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/login");
        }
        return;
      }

      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace("/dashboard");
      }
    } catch {
      setSubmitting(false);
      setError("Erro de rede. Verifique a ligação e tente novamente.");
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border p-6">
        <h1 className="text-xl font-semibold text-center">Criar conta</h1>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm">Nome</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            minLength={2}
            maxLength={80}
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
            minLength={8}
            maxLength={72}
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
          {submitting ? "A criar conta..." : "Registar"}
        </button>

        <div className="text-center text-sm text-gray-600">
          Já tem conta?{" "}
          <Link href="/login" className="underline">Iniciar sessão</Link>
        </div>
      </form>
    </main>
  );
}
