"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    if (res?.error) setError("E-mail ou palavra-passe incorretos.");
    else if (res?.ok) window.location.href = res.url ?? "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="p-8 rounded-xl shadow bg-white w-full max-w-md" onSubmit={handleSubmit}>
        <h1 className="mb-6 text-2xl font-bold text-center">Entrar</h1>
        <input
          className="mb-4 w-full border px-3 py-2 rounded"
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="mb-4 w-full border px-3 py-2 rounded"
          placeholder="Palavra-passe"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" type="submit">
          Entrar
        </button>
        <p className="text-center mt-4 text-sm">
          Não tem conta? <a href="/register" className="text-blue-600 underline">Registar</a>
        </p>
      </form>
    </div>
  );
}
