// src/components/Header.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";
import Link from "next/link";

function roleLabel(r?: "ADMIN" | "TRAINER" | "CLIENT") {
  if (r === "ADMIN") return "Admin";
  if (r === "TRAINER") return "Personal Trainer";
  return undefined;
}

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; name?: string | null; email?: string | null; role?: "ADMIN"|"TRAINER"|"CLIENT" } | undefined;

  const greetingName = user?.name || user?.email || "Utilizador";
  const label = roleLabel(user?.role);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/60">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-semibold tracking-tight hover:opacity-80">
            Fitness Pro
          </Link>
          <span className="hidden text-sm text-neutral-500 dark:text-neutral-400 md:inline">
            {`Olá, ${greetingName}${label ? ` (${label})` : ""}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
