// src/app/(app)/dashboard/admin/users/page.tsx
"use client";

import * as React from "react";

type Row = { id: string; email: string; name?: string | null; role: "ADMIN"|"TRAINER"|"CLIENT"; status: "PENDING"|"ACTIVE"|"SUSPENDED"; createdAt: string };

export default function AdminUsersPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const j = await res.json();
    setRows(Array.isArray(j?.data) ? j.data : []);
    setLoading(false);
  }
  React.useEffect(() => { void load(); }, []);

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Utilizadores</h1>
      <p style={{ color: "var(--muted)", marginBottom: 12 }}>Todos os utilizadores da plataforma.</p>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--panel, var(--bg))" }}>
            <tr><Th>Nome</Th><Th>Email</Th><Th>Função</Th><Th>Estado</Th><Th>Criado</Th></tr>
          </thead>
          <tbody>
            {loading && <TRow colSpan={5}>A carregar…</TRow>}
            {!loading && (rows ?? []).length === 0 && <TRow colSpan={5}>Sem utilizadores.</TRow>}
            {(rows ?? []).map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                <Td>{u.name ?? "—"}</Td><Td>{u.email}</Td><Td>{u.role}</Td><Td>{u.status}</Td>
                <Td>{new Date(u.createdAt).toLocaleString("pt-PT")}</Td>
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
