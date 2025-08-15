// src/app/(app)/dashboard/system/metrics/page.tsx
"use client";

import * as React from "react";
type M = { users: number; trainers: number; clients: number; pending: number; sessions7d: number };

export default function MetricsPage() {
  const [m, setM] = React.useState<M | null>(null);
  React.useEffect(() => {
    fetch("/api/system/metrics", { cache: "no-store" }).then(r => r.json()).then(j => setM(j?.data ?? null));
  }, []);

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Métricas</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12 }}>
        {[
          ["Utilizadores", m?.users],
          ["Treinadores", m?.trainers],
          ["Clientes", m?.clients],
          ["Pendentes", m?.pending],
          ["Sessões (7d)", m?.sessions7d],
        ].map(([label, value]) => (
          <div key={label as string} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "var(--bg)" }}>
            <div style={{ color: "var(--muted)", marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: "1.6rem" }}>{value ?? "—"}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
