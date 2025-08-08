"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="w-64 border-r p-4 space-y-4">
      <div className="text-sm opacity-70">
        {session?.user?.email ? `Sessão: ${session.user.email}` : "Não autenticado"}
      </div>

      <nav className="space-y-2">
        <Link className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10" href="/(app)/dashboard">
          Dashboard
        </Link>
        {/* acrescente aqui outras entradas de navegação */}
      </nav>
    </aside>
  );
}
