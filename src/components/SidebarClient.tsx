"use client";

import Link from "next/link";
import type { Role } from "@prisma/client";

type SessionUser = {
  id: string;
  role: Role;
  name?: string | null;
};

export default function SidebarClient({ user }: { user: SessionUser }) {
  const links = [
    { href: "/dashboard", label: "Dashboard", show: true },
    { href: "/trainer", label: "PT", show: user.role === "TRAINER" || user.role === "ADMIN" },
    { href: "/admin", label: "Administração", show: user.role === "ADMIN" },
  ];

  return (
    <nav className="space-y-2">
      {links
        .filter((l) => l.show)
        .map((l) => (
          <Link key={l.href} href={l.href} className="block rounded px-3 py-2 hover:bg-muted">
            {l.label}
          </Link>
        ))}
    </nav>
  );
}
