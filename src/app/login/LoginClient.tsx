"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginClient() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur">
        <LoginForm />

        {/* CTA para registo */}
        <div className="mt-6 text-center text-sm">
          <span className="opacity-70">Ainda não tem conta?</span>{" "}
          <Link
            href="/register"
            className="font-medium underline underline-offset-4 hover:opacity-100"
          >
            Registar
          </Link>
        </div>

        {/* Informação sobre aprovação */}
        <p className="mt-2 text-center text-xs opacity-60">
          Após o registo, a sua conta ficará <span className="font-semibold">pendente</span> até aprovação por um administrador.
        </p>
      </div>
    </div>
  );
}
