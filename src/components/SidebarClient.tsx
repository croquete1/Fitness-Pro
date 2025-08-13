// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  ClipboardList,
  Users,
  UserCog,
  CheckCircle2,
  ServerCog,
} from "lucide-react";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

type Item = { href: string; label: string; icon: React.ElementType; show?: boolean };

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  const base: Item[] = [
    { href: "/dashboard", label: "Início", icon: Home, show: true },
    { href: "/dashboard/trainer", label: "PT / Agenda", icon: CalendarDays, show: user.role !== "CLIENT" },
    { href: "/dashboard/pt", label: "PT / Clientes", icon: Users, show: user.role !== "CLIENT" },
    { href: "/dashboard/sessoes", label: "Sessões Agendadas", icon: ClipboardList, show: true },
  ];

  const admin: Item[] = [
    { href: "/dashboard/admin", label: "Admin", icon: UserCog, show: user.role === "ADMIN" },
    { href: "/dashboard/admin/approvals", label: "Aprovações de Conta", icon: CheckCircle2, show: user.role === "ADMIN" },
    { href: "/dashboard/admin/system", label: "Sistema", icon: ServerCog, show: user.role === "ADMIN" },
  ];

  const items = [...base, ...admin].filter((i) => i.show !== false);

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r bg-background/60 backdrop-blur md:block">
      <div className="flex h-14 items-center px-4">
        <div className="text-base font-semibold tracking-tight">
          Fitness<span className="text-primary">Pro</span>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={[
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm ring-offset-background transition-all",
              isActive(href)
                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-6 px-3">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/0 p-3">
          <p className="text-xs text-muted-foreground">
            Dica: usa a “Sessões Agendadas” para ver Hoje/Amanhã/Ontem rapidamente.
          </p>
        </div>
      </div>
    </aside>
  );
}
