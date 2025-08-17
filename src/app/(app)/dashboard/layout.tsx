import React from "react";
import ClientShell from "./ClientShell";

// Evita que o Next tente pré-renderizar estático páginas que usam o contexto
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
}
