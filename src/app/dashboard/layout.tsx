// app/dashboard/layout.tsx

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUserRole, isAuthenticated } from "@/lib/auth-server";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Se não estiver autenticado, redireciona para /login
  if (!isAuthenticated()) {
    redirect("/login");
  }

  // Lê o role do cookie no server side
  const role = getUserRole();

  return (
    <html lang="pt">
      <head>
        <title>Dashboard</title>
      </head>
      <body>
        <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          <p>Bem-vindo, {role}</p>
        </header>

        <main style={{ padding: "2rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
