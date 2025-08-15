// src/app/(app)/dashboard/pt-clientes/page.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";

export default function PTClientesPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>PT - Clientes</h1>
        <p>Listagem de clientes e gestão do personal trainer.</p>
      </main>
    </div>
  );
}
