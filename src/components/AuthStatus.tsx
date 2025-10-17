"use client";
import { useSession, signOut } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-muted">A verificar sessão...</div>;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="text-danger">
        Não autenticado. <a href="/login" className="underline">Iniciar sessão</a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-success">
        Sessão ativa: {session.user?.email || session.user?.name}
      </span>
      <button
        className="btn ghost"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Terminar sessão
      </button>
    </div>
  );
}
