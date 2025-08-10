"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // controlamos o destino manualmente
      });

      if (!res) {
        setError("Ocorreu um erro inesperado. Tente novamente.");
        setSubmitting(false);
        return;
      }
      if (res.error) {
        setError("Credenciais inválidas. Verifique o email e a palavra-passe.");
        setSubmitting(false);
        return;
      }

      // Destino único e estável para todos os perfis
      router.replace("/dashboard");
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
