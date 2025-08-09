"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AdminHeader() {
  const { data } = useSession();
  const name = data?.user?.name || data?.user?.email || "Admin";

  return (
    <header className="h-14 border-b flex items-center justify-between px-3 sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300">Administração</span>
      </nav>

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
