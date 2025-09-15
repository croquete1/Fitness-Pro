"use client";

import { useSession } from "next-auth/react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import SignOutButton from "@/components/auth/SignOutConfirmButton";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
  const { data } = useSession();
  const role = (data?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  const name = data?.user?.name ?? data?.user?.email ?? "Utilizador";
  const avatar =
    (data?.user as any)?.image ??
    "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
           <rect width='100%' height='100%' fill='#e5e7eb'/>
           <circle cx='32' cy='26' r='14' fill='#cbd5e1'/>
           <rect x='10' y='44' width='44' height='16' rx='8' fill='#cbd5e1'/>
         </svg>`
      );

  let suffix = "";
  if (role === "ADMIN") suffix = " (Admin)";
  else if (role === "TRAINER") suffix = " (Personal Trainer)";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/60 dark:bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="font-semibold">Fitness Pro</div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="hidden sm:block text-sm opacity-80">Olá, {name}{suffix}</div>
          <img
            src={avatar}
            alt="Avatar"
            className="h-8 w-8 rounded-full ring-1 ring-black/10 dark:ring-white/10 object-cover"
          />
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
