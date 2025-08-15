// src/app/(app)/dashboard/sistema/page.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";

export default function SistemaPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>Sistema</h1>
        <p>Painel de estado do sistema e configurações técnicas.</p>
      </main>
    </div>
  );
}
