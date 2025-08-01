// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import SidebarClient from "@/components/SidebarClient";

export const dynamic = "force-dynamic";      // garante SSR em toda a app quando houver session/cookies :contentReference[oaicite:1]{index=1}
export const runtime = "nodejs";             // modo padrão (não edge)
export const preferredRegion = "auto";       // deixe por padrão, sem afetar caching

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // lê os cookies do request e obtém session, ou null → pode retornar `null` se sem sessão :contentReference[oaicite:2]{index=2}
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt">
      <body className="flex min-h-screen bg-gray-50">
        {/* Sidebar só aparece se autenticado */}
        {session?.user && (
          <aside className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
            <SidebarClient user={session.user} />
          </aside>
        )}
        <main className="flex-1">
          {/* Se planeias usar SessionProvider, insere aqui */}
          {children}
        </main>
      </body>
    </html>
  );
}
