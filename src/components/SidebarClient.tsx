// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Dumbbell,
  Users,
  Shield,
  FileText,
  Settings,
  HardDriveDownload,
  UserCircle2,
  ClipboardCheck,
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
  show?: boolean;
};

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl border transition-all px-3 py-2 text-sm
        ${active ? "border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700" : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"}
      `}
    >
      <Icon className="h-4 w-4 opacity-80" />
      <span>{label}</span>
    </Link>
  );
}

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();

  const common: Item[] = [
    { href: "/dashboard", label: "Início", icon: Home, show: true },
    { href: "/dashboard/sessions", label: "Sessões", icon: CalendarDays, show: true },
    { href: "/dashboard/profile", label: "Perfil", icon: UserCircle2, show: true },
    { href: "/dashboard/settings", label: "Definições", icon: Settings, show: true },
  ];

  const trainer: Item[] = [
    { href: "/dashboard/trainer", label: "PT", icon: Dumbbell, show: user.role === "TRAINER" || user.role === "ADMIN" },
    { href: "/dashboard/trainer/approvals", label: "Aprovações (PT)", icon: ClipboardCheck, show: user.role === "TRAINER" || user.role === "ADMIN" },
  ];

  const admin: Item[] = [
    { href: "/dashboard/admin", label: "Administração", icon: Shield, show: user.role === "ADMIN" },
    { href: "/dashboard/admin/approvals", label: "Aprovações de conta", icon: ClipboardCheck, show: user.role === "ADMIN" },
    { href: "/dashboard/reports", label: "Relatórios", icon: FileText, show: user.role === "ADMIN" },
    { href: "/dashboard/system", label: "Sistema", icon: HardDriveDownload, show: user.role === "ADMIN" },
    { href: "/dashboard/pt", label: "PT / Clientes", icon: Users, show: user.role === "ADMIN" },
  ];

  const items = [...common, ...trainer, ...admin].filter(i => i.show);

  return (
    <aside className="hidden md:block w-64 shrink-0 border-r bg-white/70 backdrop-blur dark:bg-neutral-900/60">
      <div className="sticky top-0 h-[calc(100dvh-0px)] overflow-y-auto p-3">
        <div className="mb-3">
          <div className="text-sm opacity-70">Olá,</div>
          <div className="text-lg font-semibold">{user.name || user.email || "Utilizador"}</div>
          <div className="text-xs opacity-60">{user.role === "ADMIN" ? "Admin" : user.role === "TRAINER" ? "Personal Trainer" : "Cliente"}</div>
        </div>

        <nav className="space-y-2">
          {items.map((i) => (
            <NavItem key={i.href} href={i.href} label={i.label} icon={i.icon} active={pathname === i.href} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
