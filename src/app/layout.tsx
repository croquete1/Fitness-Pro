// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { getAuthSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Fitness Pro",
  description: "Gestão de treinos e administração",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // On the server, grab the current session (or null if unauthenticated)
  const session = await getAuthSession();

  return (
    <html lang="pt">
      <body className="flex min-h-screen">
        {session && (
          <aside className="w-64 border-r">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
