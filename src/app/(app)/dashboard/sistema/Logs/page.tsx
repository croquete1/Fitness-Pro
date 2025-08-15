// src/app/(app)/dashboard/sistema/Logs/page.tsx
"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";

type Log = {
  id: string;
  action: string;          // string no teu schema
  actorId?: string | null;
  target?: string | null;  // id do utilizador alvo
  message: string;
  meta?: any;
  createdAt: string;
};

export default function LogsPage() {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [action, setAction] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    qs.set("limit", "100");
    if (action) qs.set("action", action);
    const res = await fetch(`/api/system/Logs?${qs.toString()}`, { cache: "no-store" });
    const j = await res.json();
    setLogs(j?.data ?? []);
    setLoading(false);
  }

  React.useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>Logs do Sistema</h1>

        <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 0" }}>
          <label>Filtrar por ação:</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", background: "transparent" }}
          >
            <option value="">Todas</option>
            <option value="USER_SIGNED_UP">Inscrição</option>
            <option value="USER_APPROVED">Aprovado</option>
            <option value="USER_REJECTED">Rejeitado</option>
          </select>
          <button onClick={load} className="fp-pill">{loading ? "A atualizar…" : "Atualizar"}</button>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--panel, var(--bg))" }}>
                <Th>Data</Th>
                <Th>Ação</Th>
                <Th>Mensagem</Th>
                <Th>Alvo</Th>
                <Th>Ator</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td>{new Date(l.createdAt).toLocaleString()}</Td>
                  <Td><Badge label={l.action} /></Td>
                  <Td>{l.message}</Td>
                  <Td>{l.target ? <code>{l.target}</code> : <span style={{ color: "var(--muted)" }}>—</span>}</Td>
                  <Td>{l.actorId ? <code>{l.actorId}</code> : <span style={{ color: "var(--muted)" }}>—</span>}</Td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <Td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>
                    Sem registos para mostrar.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <style jsx>{`
          :global(.fp-pill) {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 6px 10px;
            background: transparent;
            cursor: pointer;
          }
        `}</style>
      </main>
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 12px",
        fontSize: 12,
        letterSpacing: ".02em",
        textTransform: "uppercase",
        ...(style || {}),
      }}
    >
      {children}
    </th>
  );
}
function Td({ children, colSpan, style }: { children: React.ReactNode; colSpan?: number; style?: React.CSSProperties }) {
  return <td colSpan={colSpan} style={{ padding: "10px 12px", verticalAlign: "top", ...(style || {}) }}>{children}</td>;
}
function Badge({ label }: { label: string }) {
  const nice =
    label === "USER_SIGNED_UP" ? "Inscrição" :
    label === "USER_APPROVED"   ? "Aprovado"  :
    label === "USER_REJECTED"   ? "Rejeitado" : label;
  return (
    <span style={{ display: "inline-block", border: "1px solid var(--border)", borderRadius: 999, padding: "2px 8px", fontSize: 12 }}>
      {nice}
    </span>
  );
}
