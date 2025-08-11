"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ShieldCheck,
  ClipboardList,
  Settings,
} from "lucide-react";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },

    // Sessões (PT/Admin)
    {
      href: "/dashboard/trainer",
      label: "Sessões agendadas",
      icon: CalendarDays,
      show: user.role === "TRAINER" || user.role === "ADMIN",
    },

    // Secção Admin
    {
      href: "/dashboard/admin",
      label: "Administração",
      icon: ShieldCheck,
      show: user.role === "ADMIN",
    },
    {
      href: "/dashboard/admin/users",
      label: "Utilizadores",
      icon: Users,
      show: user.role === "ADMIN",
    },
    {
      href: "/dashboard/admin/sessions",
      label: "Sessões (todos)",
      icon: ClipboardList,
      show: user.role === "ADMIN",
    },
    {
      href: "/dashboard/admin/approvals",
      label: "Aprovações",
      icon: ShieldCheck,
      show: user.role === "ADMIN",
    },

    // (Futuro) Definições pessoais
    { href: "/dashboard/settings", label: "Definições", icon: Settings, show: false },
  ].filter((i) => i.show);

  return (
    <aside className="sticky top-0 h-dvh w-64 shrink-0 border-r bg-background/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mb-3 rounded-xl border bg-card p-3">
        <div className="text-sm font-semibold leading-tight">
          {user.name || user.email}
        </div>
        <div className="text-xs text-muted-foreground">
          {user.role === "ADMIN"
            ? "Admin"
            : user.role === "TRAINER"
            ? "Personal Trainer"
            : "Cliente"}
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                active
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-foreground/90",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
