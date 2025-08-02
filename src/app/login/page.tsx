// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const callback = params.get("callbackUrl") || params.get("from");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const res = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password,
      callbackUrl: callback || "/home",
    });

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      router.push(callback || "/home");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        {errorMsg && <p className="text-red-600 mb-3">{errorMsg}</p>}

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

        <label className="block mb-4">
          <span className="text-sm">Senha</span>
          <input
            type="password"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Entrar
        </button>

        <p className="mt-4 text-center text-sm">
          Não tem conta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Registar‑se
          </a>
        </p>
      </form>
    </div>
  );
}
