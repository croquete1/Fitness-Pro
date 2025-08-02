"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mostra mensagem de erro vinda do NextAuth (se acederes por /login?error=1)
  const urlError = searchParams.get("error");
  const hasUrlError = urlError && !error;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Login usando CredentialsProvider do NextAuth
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou palavra-passe inválidos.");
    } else if (res?.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-200 via-white to-blue-300">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6"
        autoComplete="off"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">Fitness Pro</h1>
        <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Iniciar Sessão</h2>
        {hasUrlError && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 text-center">
            Sessão expirada ou acesso não autorizado. Volte a iniciar sessão.
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 text-center">
            {error}
          </div>
        )}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="seu@email.com"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="password">
            Palavra-passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="********"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
          disabled={loading}
        >
          {loading ? "A autenticar..." : "Entrar"}
        </button>
        <div className="text-center text-sm mt-2">
          Não tem conta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}
