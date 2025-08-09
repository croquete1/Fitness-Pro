"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser, UserRole } from "@/lib/types";
import { useMemo } from "react";

type Props = {
  user: SessionUser;
};

export default function SidebarClient({ user }: Props) {
  const pathname = usePathname();

  const items = useMemo(() => {
    const base = [
      { href: "/dashboard", label: "Visão Geral" },
    ];

    const roleItems: Record<UserRole, { href: string; label: string }[]> = {
      cliente: [
        { href: "/dashboard/sessions", label: "Minhas Sessões" },
      ],
      pt: [
        { href: "/trainer/clients", label: "Meus Clientes" },
        { href: "/trainer/schedule", label: "Agenda" },
      ],
      admin: [
        { href: "/admin", label: "Administração" },
        { href: "/admin/users", label: "Utilizadores" },
      ],
    };

    return [...base, ...(roleItems[user.role] ?? [])];
  }, [user.role]);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r min-h-dvh">
      <div className="p-4 border-b">
        <div className="font-semibold">Fitness Pro</div>
        <div className="text-sm text-gray-500">
          {user.name ? `Olá, ${user.name}` : "Bem-vindo(a)!"}
        </div>
      </div>
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`block rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3 border-t text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Fitness Pro
      </div>
    </aside>
  );
}
