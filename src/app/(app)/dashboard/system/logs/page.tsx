// src/app/(app)/dashboard/system/logs/page.tsx
"use client";

import * as React from "react";
type Log = { id: string; action: string; target?: string | null; createdAt: string; actorEmail?: string | null };

export default function LogsPage() {
  const [rows, setRows] = React.useState<Log[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/system/logs", { cache: "no-store" });
    const j = await res.json();
    setRows(Array.isArray(j?.data) ? j.data : []);
    setLoading(false);
  }
  React.useEffect(() => { void load(); }, []);

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Logs</h1>
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--panel, var(--bg))" }}>
            <tr><Th>Quando</Th><Th>Ação</Th><Th>Ator</Th><Th>Alvo</Th></tr>
          </thead>
          <tbody>
            {loading && <TRow colSpan={4}>A carregar…</TRow>}
            {!loading && (rows ?? []).length === 0 && <TRow colSpan={4}>Sem logs.</TRow>}
            {(rows ?? []).map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                <Td>{new Date(l.createdAt).toLocaleString("pt-PT")}</Td>
                <Td>{l.action}</Td>
                <Td>{l.actorEmail ?? "—"}</Td>
                <Td>{l.target ?? "—"}</Td>
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
