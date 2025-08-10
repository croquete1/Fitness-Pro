"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type RoleType = "ADMIN" | "TRAINER" | "CLIENT";
export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: RoleType;
};

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard", show: true },
    { href: "/trainer", label: "PT", show: user.role === "TRAINER" || user.role === "ADMIN" },
    { href: "/admin", label: "Administração", show: user.role === "ADMIN" },
  ].filter((i) => i.show);

  return (
    <aside className="w-56 shrink-0 border-r bg-white/50 backdrop-blur">
      <div className="p-4 text-sm opacity-70">Olá{user.name ? `, ${user.name}` : ""}</div>
      <nav className="flex flex-col gap-1 p-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-gray-900 text-white" : "hover:bg-gray-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
