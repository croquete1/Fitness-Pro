"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Se já autenticado, redireciona
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nome = formData.get("nome") as string;

    // Registo no Supabase
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome }
      }
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "O e-mail já está registado."
          : signUpError.message
      );
      setLoading(false);
      return;
    }

    // Login automático após registo
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Erro ao iniciar sessão automaticamente: " + res.error);
      return;
    }

    // O redirecionamento é feito pelo useEffect acima
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
          <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
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
            autoComplete="new-password"
            minLength={6}
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
          {loading ? "A criar conta..." : "Criar conta"}
        </button>
        <div className="text-center text-sm mt-2">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
}
