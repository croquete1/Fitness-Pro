"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";

export default function Header() {
  const { data: session, status } = useSession();

  const name =
    (session?.user?.name && session.user.name.trim()) ||
    session?.user?.email?.split("@")[0] ||
    "Utilizador";

  const role =
    ((session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined) ??
    undefined;

  let roleLabel = "";
  if (role === "ADMIN") roleLabel = " (Admin)";
  else if (role === "TRAINER") roleLabel = " (Personal Trainer)";

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-semibold">
            Fitness Pro
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {status === "loading" ? "A carregar..." : `Olá, ${name}${roleLabel}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Iniciar sessão
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
