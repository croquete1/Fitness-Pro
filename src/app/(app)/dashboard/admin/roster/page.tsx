// src/app/(app)/dashboard/admin/roster/page.tsx
"use client";

import * as React from "react";

type Member = { id: string; name?: string | null; email: string; role: "TRAINER" | "CLIENT"; clients?: number };

export default function AdminRosterPage() {
  const [rows, setRows] = React.useState<Member[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/roster", { cache: "no-store" });
    const j = await res.json();
    setRows(Array.isArray(j?.data) ? j.data : []);
    setLoading(false);
  }
  React.useEffect(() => { void load(); }, []);

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Escala/Equipa</h1>
      <p style={{ color: "var(--muted)", marginBottom: 12 }}>Lista de treinadores e número de clientes atribuídos.</p>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--panel, var(--bg))" }}>
            <tr><Th>Nome</Th><Th>Email</Th><Th>Função</Th><Th>Clientes</Th></tr>
          </thead>
          <tbody>
            {loading && <TRow colSpan={4}>A carregar…</TRow>}
            {!loading && (rows ?? []).length === 0 && <TRow colSpan={4}>Sem membros.</TRow>}
            {(rows ?? []).map((m) => (
              <tr key={m.id} style={{ borderTop: "1px solid var(--border)" }}>
                <Td>{m.name ?? "—"}</Td><Td>{m.email}</Td><Td>{m.role === "TRAINER" ? "PT" : "Cliente"}</Td><Td>{m.clients ?? 0}</Td>
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
