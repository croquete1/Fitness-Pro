// src/app/(app)/dashboard/admin/exercises/page.tsx
"use client";

import * as React from "react";

type Exercise = { id: string; name: string; category?: string; updatedAt?: string };

export default function AdminExercisesPage() {
  const [rows, setRows] = React.useState<Exercise[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/exercises", { cache: "no-store" });
    const j = await res.json();
    setRows(Array.isArray(j?.data) ? j.data : []);
    setLoading(false);
  }
  React.useEffect(() => { void load(); }, []);

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Exercícios</h1>
      <p style={{ color: "var(--muted)", marginBottom: 12 }}>Catálogo de exercícios (apenas leitura por agora).</p>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--panel, var(--bg))" }}>
            <tr>
              <Th>Nome</Th><Th>Categoria</Th><Th>Atualizado</Th>
            </tr>
          </thead>
          <tbody>
            {loading && <TRow colSpan={3}>A carregar…</TRow>}
            {!loading && (rows ?? []).length === 0 && <TRow colSpan={3}>Sem exercícios.</TRow>}
            {(rows ?? []).map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                <Td>{e.name}</Td>
                <Td>{e.category ?? "—"}</Td>
                <Td>{e.updatedAt ? new Date(e.updatedAt).toLocaleString("pt-PT") : "—"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10 }}>
        <button className="fp-pill" onClick={() => void load()}>🔄 <span className="label" style={{ marginLeft: 6 }}>Atualizar</span></button>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "10px 14px" }}>{children}</td>;
}
function TRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return <tr><td colSpan={colSpan} style={{ padding: 16, color: "var(--muted)" }}>{children}</td></tr>;
}
