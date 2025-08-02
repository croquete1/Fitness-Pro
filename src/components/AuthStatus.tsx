"use client";
import { useSession, signOut } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-gray-600">A verificar sessão...</div>;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="text-red-600">
        Não autenticado. <a href="/login" className="underline">Iniciar sessão</a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-green-700">
        Sessão ativa: {session.user?.email || session.user?.name}
      </span>
      <button
        className="ml-2 text-sm px-2 py-1 bg-gray-200 rounded hover:bg-red-200 transition"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Terminar sessão
      </button>
    </div>
  );
}
