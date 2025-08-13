"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, CalendarDays, Dumbbell, UsersRound,
  UserCheck, Shield, Cog, BarChart3,
  User as UserIcon, Settings, CreditCard
} from "lucide-react";

export type RawUser = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

type Props = { user: RawUser };

export default function SidebarClient({ user }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const items = [
    { href: "/dashboard",              label: "Início",          icon: Home,         show: true },
    { href: "/dashboard/sessions",     label: "Sessões",         icon: CalendarDays, show: true },
    { href: "/dashboard/pt",           label: "PT",              icon: Dumbbell,     show: user.role === "TRAINER" || user.role === "ADMIN" },
    { href: "/dashboard/pt/clients",   label: "PT · Clientes",   icon: UsersRound,   show: user.role === "TRAINER" || user.role === "ADMIN" },

    // ADMIN
    { href: "/dashboard/admin/approvals", label: "Aprovações", icon: UserCheck,  show: user.role === "ADMIN" },
    { href: "/dashboard/admin",           label: "Administração", icon: Shield,  show: user.role === "ADMIN" },
    { href: "/dashboard/system",          label: "Sistema",     icon: Cog,         show: user.role === "ADMIN" },
    { href: "/dashboard/reports",         label: "Relatórios",  icon: BarChart3,   show: user.role === "ADMIN" },
    { href: "/dashboard/billing",         label: "Faturação",   icon: CreditCard,  show: user.role === "ADMIN" },

    // Gerais
    { href: "/dashboard/profile",      label: "Perfil",          icon: UserIcon,     show: true },
    { href: "/dashboard/settings",     label: "Definições",      icon: Settings,     show: true },
  ].filter(i => i.show);

  return (
    <aside className="w-64 shrink-0 border-r bg-white/50 dark:bg-black/20 backdrop-blur">
      <div className="p-4 text-sm">
        <div className="font-medium opacity-70">Olá,</div>
        <div className="font-semibold">
          {user.name ?? user.email}
        </div>
        <div className="text-xs opacity-60">
          {user.role === "ADMIN" ? "Admin"
            : user.role === "TRAINER" ? "Personal Trainer"
            : "Cliente"}
        </div>
      </div>

      <nav className="px-2 pb-6 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={[
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted/60"
              ].join(" ")}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
