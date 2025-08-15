// src/app/(app)/dashboard/admin/plans/page.tsx
"use client";

import * as React from "react";
type Plan = { id: string; name: string; author?: string; sessions?: number; updatedAt?: string };

export default function AdminPlansPage() {
  const [rows, setRows] = React.useState<Plan[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/plans", { cache: "no-store" });
    const j = await res.json();
    setRows(Array.isArray(j?.data) ? j.data : []);
    setLoading(false);
  }
  React.useEffect(() => { void load(); }, []);

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Planos (Admin)</h1>
      <p style={{ color: "var(--muted)", marginBottom: 12 }}>Biblioteca global de planos.</p>
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--panel, var(--bg))" }}>
            <tr><Th>Plano</Th><Th>Autor</Th><Th>Sessões</Th><Th>Atualizado</Th></tr>
          </thead>
          <tbody>
            {loading && <TRow colSpan={4}>A carregar…</TRow>}
            {!loading && (rows ?? []).length === 0 && <TRow colSpan={4}>Sem planos.</TRow>}
            {(rows ?? []).map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                <Td>{p.name}</Td><Td>{p.author ?? "—"}</Td><Td>{p.sessions ?? 0}</Td>
                <Td>{p.updatedAt ? new Date(p.updatedAt).toLocaleString("pt-PT") : "—"}</Td>
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

const Th = (p: any) => <th style={{ textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontWeight: 700 }} {...p} />;
const Td = (p: any) => <td style={{ padding: "10px 14px" }} {...p} />;
const TRow = ({ colSpan, children }: any) => <tr><td colSpan={colSpan} style={{ padding: 16, color: "var(--muted)" }}>{children}</td></tr>;
