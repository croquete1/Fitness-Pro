"use client";

import { useSession } from "next-auth/react";
import SidebarClient from "./SidebarClient";

export default function SidebarWrapper() {
  const { status } = useSession();

  // Pode mostrar um placeholder enquanto a sessão carrega
  if (status === "loading") {
    return (
      <aside className="w-64 border-r p-4">
        <div className="text-sm opacity-70">A carregar…</div>
      </aside>
    );
  }

  // O SidebarClient já lê a sessão internamente (useSession)
  return <SidebarClient />;
}
