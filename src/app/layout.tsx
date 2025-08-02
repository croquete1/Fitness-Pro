// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import SidebarClient from "@/components/SidebarClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Obtém a sessão atual (ou null, se usuário não autenticado)
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt">
      <body className="flex min-h-screen bg-gray-50">
        {session?.user && (
          <aside className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
            <SidebarClient user={session.user} />
          </aside>
        )}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
