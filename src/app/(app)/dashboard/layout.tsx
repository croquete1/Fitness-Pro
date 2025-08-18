// Server Component
import type { ReactNode } from "react";
import Providers from "@/app/providers";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen flex bg-[var(--bg,white)]">
        {/* Rail compacto participa no flex (64px) */}
        <Sidebar />
        {/* Conteúdo */}
        <div className="flex-1 min-w-0 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
