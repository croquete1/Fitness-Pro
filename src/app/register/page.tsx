// src/app/register/page.tsx
"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password || password !== confirm) {
      setError("Preencha todos os campos corretamente");
      return;
    }

    const { error: supaError } = await supabase.auth.signUp({ email, password });

    if (supaError) {
      setError(supaError.message);
    } else {
      setSuccess("Conta criada com sucesso!");
      setTimeout(() => router.push("/login"), 3000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Criar Conta</h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        {success && <p className="text-green-700 mb-3">{success}</p>}

        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input
            type="email"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Senha (mín. 6 caracteres)</span>
          <input
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Confirmar Senha</span>
          <input
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full border rounded px-3 py-2"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Registar
        </button>

        <p className="mt-4 text-center text-sm">
          Já tens conta?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}
