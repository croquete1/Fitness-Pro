// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Usa o caminho correto!
import SidebarClient from "@/components/SidebarClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt">
      <body className="flex min-h-screen bg-gray-50">
        <SessionProvider session={session}>
          {/* Sidebar só aparece se autenticado */}
          {session?.user && (
            <aside className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
              <SidebarClient user={session.user} />
            </aside>
          )}
          <main className="flex-1">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
