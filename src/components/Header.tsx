"use client";

import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { data } = useSession();
  const role = (data?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;

  const greetingRole =
    role === "ADMIN" ? " (Admin)" :
    role === "TRAINER" ? " (Personal Trainer)" : "";

  const name = data?.user?.name || data?.user?.email || "Utilizador";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/60 dark:bg-black/30 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="font-medium">
          <span className="opacity-70">Fitness Pro</span>{" "}
          <span className="opacity-60">|</span>{" "}
          <span className="opacity-80">Olá, {name}{greetingRole}</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/60"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
