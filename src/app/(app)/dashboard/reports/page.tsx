// src/app/(app)/dashboard/reports/page.tsx
"use client";

export default function ReportsPage() {
  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Relatórios</h1>
      <p style={{ color: "var(--muted)" }}>Exportação de dados e relatórios. (placeholder)</p>
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", padding: 12 }}>
        Em breve: exportação CSV/PDF de utilizadores, sessões e métricas.
      </div>
    </main>
  );
}
