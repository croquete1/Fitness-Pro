// src/components/Header.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";

function roleLabel(role?: "ADMIN" | "TRAINER" | "CLIENT") {
  if (role === "ADMIN") return "Admin";
  if (role === "TRAINER") return "Personal Trainer";
  return undefined;
}

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { id: string; name?: string | null; email?: string | null; role?: "ADMIN" | "TRAINER" | "CLIENT" }
    | undefined;

  const label = roleLabel(user?.role);
  const greet =
    user?.name
      ? `Olá, ${user.name}${label ? ` (${label})` : ""}`
      : user?.email
        ? `Olá, ${user.email}${label ? ` (${label})` : ""}`
        : "Olá";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:bg-neutral-900/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="text-sm md:text-base font-medium opacity-80">
          <span className="font-semibold">Fitness Pro</span> <span className="mx-2">•</span> {greet}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
