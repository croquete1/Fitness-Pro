'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarProvider";

export default function AppHeader() {
  const router = useRouter();
  const { /* opcional: podes usar aqui alguma ação */ } = useSidebar();

  return (
    <div className="header-inner">
      <div className="left">
        {/* Search */}
        <div className="search">
          <input
            type="search"
            placeholder="Pesquisar..."
            aria-label="Pesquisar"
          />
        </div>
      </div>

      <div className="right">
        {/* Notificações */}
        <button className="btn icon" aria-label="Notificações" title="Notificações">🔔</button>
        {/* Sair */}
        <button className="btn" onClick={() => router.push("/api/auth/signout")}>
          Sair
        </button>
      </div>
    </div>
  );
}
