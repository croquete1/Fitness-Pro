// src/components/Header.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";

const roleLabel: Record<"ADMIN" | "TRAINER" | "CLIENT", string> = {
  ADMIN: "Admin",
  TRAINER: "Personal Trainer",
  CLIENT: "Cliente",
};

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { id: string; name?: string | null; email?: string | null; role?: "ADMIN" | "TRAINER" | "CLIENT" }
    | undefined;

  const name =
    (user?.name && user.name.trim()) ||
    (user?.email ? user.email.split("@")[0] : "Utilizador");
  const role = user?.role ?? "CLIENT";
  const greet = `Olá, ${name}${role !== "CLIENT" ? ` (${roleLabel[role]})` : ""}`;

  return (
    <header className="sticky top-0 z-40 border-b bg-gradient-to-r from-background/60 to-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{greet}</p>
            <p className="truncate text-xs text-muted-foreground">
              Bem-vindo à sua área de trabalho
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
