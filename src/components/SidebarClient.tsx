// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type UserRole = "cliente" | "pt" | "admin";
type Props = { user: { id: string; role: UserRole; name?: string | null; email?: string } };

export default function SidebarClient({ user }: Props) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard", show: true },
    { href: "/trainer", label: "PT",          show: user.role === "pt" || user.role === "admin" },
    { href: "/admin",    label: "Administração", show: user.role === "admin" },
  ].filter(i => i.show);

  return (
    <aside className="w-full max-w-56">
      <ul className="space-y-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={[
                  "block rounded-md px-3 py-2 text-sm",
                  active ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                         : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                ].join(" ")}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
