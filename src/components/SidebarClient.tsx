"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, CalendarDays, Dumbbell, Users, Shield, Server, BarChart3, Settings, CreditCard
} from "lucide-react";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
};

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/dashboard", label: "Início", icon: Home, show: true },
    { href: "/dashboard/sessions", label: "Sessões", icon: CalendarDays, show: true },

    // Área PT
    { href: "/dashboard/trainer", label: "PT", icon: Dumbbell, show: user.role !== "CLIENT" },
    { href: "/dashboard/pt/clients", label: "PT · Clientes", icon: Users, show: user.role !== "CLIENT" },

    // Área Admin
    { href: "/dashboard/admin", label: "Administração", icon: Shield, show: user.role === "ADMIN" },
    { href: "/dashboard/reports", label: "Relatórios", icon: BarChart3, show: user.role === "ADMIN" },
    { href: "/dashboard/system", label: "Sistema", icon: Server, show: user.role === "ADMIN" },

    // Conta
    { href: "/dashboard/billing", label: "Faturação", icon: CreditCard, show: true },
    { href: "/dashboard/profile", label: "Perfil", icon: Settings, show: true },
  ];

  return (
    <aside className="w-64 shrink-0 border-r bg-white/60 dark:bg-black/30 backdrop-blur">
      <div className="p-4">
        <div className="text-xs uppercase opacity-60 mb-1">Olá,</div>
        <div className="font-semibold leading-tight truncate">
          {user.name ?? user.email ?? "Utilizador"}
        </div>
        <div className="text-xs opacity-60">
          {user.role === "ADMIN" ? "Admin" : user.role === "TRAINER" ? "Personal Trainer" : "Cliente"}
        </div>
      </div>

      <nav className="px-2 pb-4 space-y-1">
        {items.filter(i => i.show).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-black/[0.06] dark:bg-white/10 font-medium"
                  : "hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              ].join(" ")}
            >
              <Icon className="h-4 w-4 opacity-80" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
