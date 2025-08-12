// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, ShieldCheck } from "lucide-react";
import useSWR from "swr";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

type Props = { user: RawUser };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-primary/10 text-primary dark:bg-primary/15"
          : "hover:bg-muted text-foreground/90",
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </span>
      {typeof badge === "number" && badge > 0 && (
        <span className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function SidebarClient({ user }: Props) {
  const pathname = usePathname();

  const showApprovals = user.role === "ADMIN";
  const { data } = useSWR<{ pending: number }>(
    showApprovals ? "/api/admin/approvals/count" : null,
    fetcher,
    { refreshInterval: 15_000 } // atualiza de 15 em 15s
  );

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
      show: showApprovals,
      active: pathname.startsWith("/dashboard/admin/approvals"),
      badge: data?.pending ?? 0,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="p-4">
        <div className="mb-4">
          <div className="text-xs text-muted-foreground">Sessão</div>
          <div className="font-medium truncate">{user.name || user.email || "Utilizador"}</div>
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
                badge={i.badge}
              />
            ))}
        </nav>
      </div>
    </aside>
  );
}
