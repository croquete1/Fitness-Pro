// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/icons";
import { getSidebarItems } from "@/lib/nav";

export type RawUser = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

export default function SidebarClient({ user }: { user: RawUser }) {
  const pathname = usePathname();
  const items = getSidebarItems(user.role);

  return (
    <aside
      className="sticky top-0 h-dvh w-[270px] shrink-0 border-r bg-white/70 dark:bg-zinc-900/50
                 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/40
                 shadow-[inset_0_1px_0_0_rgba(255,255,255,.6)]
                 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,.06)]"
    >
      <div className="p-4">
        <div className="mb-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10
                        dark:from-indigo-500/15 dark:via-purple-500/15 dark:to-pink-500/15
                        border border-zinc-200/60 dark:border-zinc-800/60 p-4">
          <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Olá
          </div>
          <div className="text-sm font-medium">
            {user.name ?? user.email}
            {user.role === "ADMIN" && <span className="ml-2 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">Admin</span>}
            {user.role === "TRAINER" && <span className="ml-2 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">Personal Trainer</span>}
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition
                  ${active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300"}`}
              >
                <AppIcon name={item.icon} className={`h-5 w-5 ${active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
