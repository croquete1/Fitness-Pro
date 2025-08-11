// src/components/Header.tsx
"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:bg-neutral-900/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="group inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500" />
            <span className="text-lg font-semibold tracking-tight group-hover:opacity-90">
              Fitness Pro
            </span>
          </Link>
        </div>

        {/* Center (search – opcional) */}
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <input
              placeholder="Pesquisar…"
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm
                         outline-none ring-0 focus:border-indigo-400 dark:border-neutral-700
                         dark:bg-neutral-900 dark:focus:border-indigo-500"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/trainer"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            Nova sessão
          </Link>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
