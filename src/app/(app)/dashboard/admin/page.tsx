// src/app/(app)/dashboard/admin/page.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";

export default function AdminPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>Administração</h1>
        <p>Área de gestão administrativa. (Placeholder — sem carregamento infinito.)</p>
      </main>
    </div>
  );
}
