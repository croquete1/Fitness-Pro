"use client";

import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data } = useSession();
  const name = data?.user?.name ?? data?.user?.email ?? "Utilizador";

  return (
    <header className="h-14 border-b flex items-center justify-between px-3 sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <span className="text-sm text-gray-600">Dashboard</span>
      <div className="flex items-center gap-3">
        <span className="text-sm">{name}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm border rounded-md px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
