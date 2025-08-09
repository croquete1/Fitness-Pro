"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className ?? "text-sm border rounded-md px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"}
    >
      Sair
    </button>
  );
}
