// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, CheckSquare, Wrench } from "lucide-react";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

type Item = { href: string; label: string; icon: React.ComponentType<any>; show: boolean };

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/dashboard", label: "Dashboard",     icon: LayoutDashboard, show: true },
    { href: "/dashboard/pt/clientes", label: "PT / Clientes", icon: Users, show: user.role === "TRAINER" || user.role === "ADMIN" },
    { href: "/dashboard/sessoes",     label: "Sessões",       icon: ClipboardList, show: user.role !== "CLIENT" || true }, // podes deixar visível a todos
    { href: "/dashboard/aprovacoes",  label: "Aprovações",    icon: CheckSquare,   show: user.role === "ADMIN" },
    { href: "/dashboard/sistema",     label: "Sistema",       icon: Wrench,        show: user.role === "ADMIN" },
  ];

  return (
    <aside className="sticky top-0 h-dvh w-[240px] shrink-0 border-r bg-white/70 p-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
      <nav className="space-y-1">
        {items.filter(i => i.show).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition
                ${active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
