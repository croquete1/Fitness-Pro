// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type RawUser = {
  id: string;
  email?: string;
  name?: string;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard", show: true },
    { href: "/dashboard/sessions", label: "Sessões", show: user.role === "ADMIN" || user.role === "TRAINER" },
    { href: "/dashboard/trainer", label: "PT", show: user.role === "ADMIN" || user.role === "TRAINER" },
    { href: "/admin", label: "Administração", show: user.role === "ADMIN" },
  ].filter((i) => i.show);

  return (
    <aside className="w-64 border-r min-h-dvh p-4 hidden md:block">
      <div className="text-sm mb-4 opacity-70">
        {user.name ?? user.email}
        <span className="ml-1 text-xs px-2 py-0.5 border rounded-full">
          {user.role}
        </span>
      </div>
      <nav className="space-y-1">
        {items.map((i) => {
          const active = pathname === i.href || pathname?.startsWith(i.href + "/");
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-muted font-medium" : "hover:bg-muted/60"
              }`}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
