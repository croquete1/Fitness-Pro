"use client";

import ThemeToggle from "./ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";

type Role = "ADMIN" | "TRAINER" | "CLIENT";
export type RawUser = { id: string; name: string | null; email: string; role: Role };

function formatGreeting(user: RawUser) {
  const displayName = user.name ?? user.email.split("@")[0];
  switch (user.role) {
    case "ADMIN":
      return `Olá, ${displayName} (admin)`;
    case "TRAINER":
      return `Olá, ${displayName} Personal Trainer`;
    default:
      return `Olá, ${displayName}`;
  }
}

export default function Header({ user }: { user: RawUser }) {
  const greeting = formatGreeting(user);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-muted-foreground">Dashboard</span>
          <h1 className="text-base md:text-lg font-semibold tracking-tight">{greeting}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
