"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Shield,
  BarChart3,
  User,
  Settings,
  SlidersHorizontal,
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

function cx(...cls: Array<string | false | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/dashboard",            label: "Início",        icon: LayoutDashboard,  show: true },
    { href: "/dashboard/sessions",   label: "Sessões",       icon: CalendarDays,     show: true },
    { href: "/dashboard/trainer",    label: "PT",            icon: Dumbbell,         show: user.role === "ADMIN" || user.role === "TRAINER" },
    { href: "/dashboard/reports",    label: "Relatórios",    icon: BarChart3,        show: user.role === "ADMIN" },
    { href: "/dashboard/admin",      label: "Administração", icon: Shield,           show: user.role === "ADMIN" },
    { href: "/dashboard/system",     label: "Sistema",       icon: Settings,         show: user.role === "ADMIN" },
    { href: "/dashboard/profile",    label: "Perfil",        icon: User,             show: true },
    { href: "/dashboard/settings",   label: "Definições",    icon: SlidersHorizontal,show: true },
  ];

  return (
    <aside className="w-64 shrink-0 border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4">
        <div className="text-sm opacity-70">Olá,</div>
        <div className="font-semibold truncate">
          {user.name || user.email || "Utilizador"}
        </div>
        <div className="text-xs mt-0.5 opacity-60">
          {user.role === "ADMIN" ? "Admin" : user.role === "TRAINER" ? "Personal Trainer" : "Cliente"}
        </div>
      </div>

      <nav className="px-2 py-2 space-y-1">
        {items.filter(i => i.show).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cx(
                "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "hover:bg-muted hover:text-foreground/90"
              )}
            >
              <Icon className={cx("h-4 w-4", active && "text-primary")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
