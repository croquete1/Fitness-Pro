"use client";

import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";

export default function Header() {
  const { data } = useSession();
  const role = (data?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  const name = data?.user?.name ?? data?.user?.email ?? "Utilizador";

  let suffix = "";
  if (role === "ADMIN") suffix = " (Admin)";
  else if (role === "TRAINER") suffix = " (Personal Trainer)";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/60 dark:bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl flex items-center justify-between gap-4 px-4 py-3">
        <div className="font-semibold">Fitness Pro</div>
        <div className="flex items-center gap-3">
          <div className="text-sm opacity-80">Olá, {name}{suffix}</div>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
