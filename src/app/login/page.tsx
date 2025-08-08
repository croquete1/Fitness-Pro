"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Entrar</h1>
        <p className="text-sm opacity-80 text-center">Autenticação via Google</p>
        <button
          className="w-full rounded-md border px-4 py-2 font-medium hover:bg-card"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continuar com Google
        </button>
      </div>
    </main>
  );
}
