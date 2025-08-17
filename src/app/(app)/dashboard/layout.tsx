// Server Component
import type { ReactNode } from "react";
import Providers from "@/app/providers";           // client wrapper (theme + sidebar context)
import Sidebar from "@/components/Sidebar";        // client component
import AppHeader from "@/components/layout/AppHeader"; // client component

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {/* Shell base: a sidebar fixa + conteúdo. Nada de event handlers aqui. */}
      <div className="min-h-screen flex bg-[var(--bg,white)]">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
