"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

// Importa o cliente Supabase do lado do cliente
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const supabase = createClientComponentClient();

    // Cria a conta no Supabase Auth
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Guarda nome no user_metadata (ou na sua tabela de perfis)
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "O e-mail já se encontra registado."
          : "Erro ao registar. Tente novamente."
      );
      setLoading(false);
      return;
    }

    // Autentica automaticamente após criar a conta
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Registado, mas ocorreu um erro ao autenticar. Por favor, tente aceder.");
    } else {
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
        <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Criar Conta</h2>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 text-center">
            {error}
          </div>
        )}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="O seu nome"
            disabled={loading}
          />
        </div>
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
            minLength={6}
            autoComplete="new-password"
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
          {loading ? "A registar..." : "Registar"}
        </button>
        <div className="text-center text-sm mt-2">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Iniciar sessão
          </Link>
        </div>
      </form>
    </div>
  );
}
