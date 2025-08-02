import "./globals.css";
import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import SidebarClient from "@/components/SidebarClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="pt">
      <body className="flex min-h-screen bg-gray-50">
        {session?.user?.email && (
          <aside className="w-64 border-r bg-white">
            <SidebarClient user={session.user as any} />
          </aside>
        )}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
