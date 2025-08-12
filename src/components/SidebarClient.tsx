// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, ShieldCheck } from "lucide-react";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

type Props = {
  user: RawUser;
};

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-primary/10 text-primary dark:bg-primary/15"
          : "hover:bg-muted text-foreground/90",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function SidebarClient({ user }: Props) {
  const pathname = usePathname();

  const items = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      show: true,
      active: pathname === "/dashboard" || pathname === "/",
    },
    {
      href: "/dashboard/trainer",
      label: "Sessões",
      icon: CalendarCheck,
      show: user.role === "TRAINER" || user.role === "ADMIN",
      active: pathname.startsWith("/dashboard/trainer"),
    },
    {
      href: "/dashboard/admin/approvals",
      label: "Aprovações",
      icon: ShieldCheck,
      show: user.role === "ADMIN",
      active: pathname.startsWith("/dashboard/admin/approvals"),
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="p-4">
        <div className="mb-4">
          <div className="text-xs text-muted-foreground">Sessão</div>
          <div className="font-medium truncate">
            {user.name || user.email || "Utilizador"}
          </div>
          <div className="text-xs text-muted-foreground">
            {user.role === "ADMIN"
              ? "Admin"
              : user.role === "TRAINER"
              ? "Personal Trainer"
              : "Cliente"}
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {items
            .filter((i) => i.show)
            .map((i) => (
              <NavItem
                key={i.href}
                href={i.href}
                label={i.label}
                icon={i.icon}
                active={i.active}
              />
            ))}
        </nav>
      </div>
    </aside>
  );
}
