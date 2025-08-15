"use client";

import * as React from "react";

type Row = {
  id: string;
  email: string;
  name: string | null;
  role: "TRAINER" | "CLIENT";
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

export default function ApprovalsPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/approvals", { cache: "no-store" });
    const j = await res.json();
    setRows(Array.isArray(j?.data) ? j.data : []);
    setLoading(false);
  }

  React.useEffect(() => { void load(); }, []);

  async function act(id: string, action: "approve" | "reject") {
    // otimista
    const prev = rows ?? [];
    setRows((r) => (r ?? []).filter((x) => x.id !== id));
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch {
      // rollback
      setRows(prev);
      alert("Não foi possível executar a ação. Tenta novamente.");
    }
  }

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>
        Aprovações de Conta
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Lista em tempo real de contas pendentes (dados via API).
      </p>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          background: "var(--bg)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "0.98rem",
          }}
        >
          <thead style={{ background: "var(--panel, var(--bg))" }}>
            <tr>
              <th style={th}>Nome</th>
              <th style={th}>Email</th>
              <th style={th}>Função</th>
              <th style={th}>Criado em</th>
              <th style={{ ...th, textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={td}>
                  A carregar…
                </td>
              </tr>
            )}

            {!loading && rows && rows.length === 0 && (
              <tr>
                <td colSpan={5} style={td}>
                  <div style={{ padding: "18px 0", color: "var(--muted)" }}>
                    Sem contas pendentes neste momento.
                  </div>
                </td>
              </tr>
            )}

            {(rows ?? []).map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={td}>{u.name ?? "—"}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.role === "TRAINER" ? "Personal Trainer" : "Cliente"}</td>
                <td style={td}>
                  {new Date(u.createdAt).toLocaleString("pt-PT")}
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 8 }}>
                    <button className="fp-pill" onClick={() => act(u.id, "approve")} title="Aprovar">
                      ✅ <span className="label" style={{ marginLeft: 6 }}>Aprovar</span>
                    </button>
                    <button className="fp-pill" onClick={() => act(u.id, "reject")} title="Rejeitar">
                      ✖️ <span className="label" style={{ marginLeft: 6 }}>Rejeitar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="fp-pill" onClick={() => void load()}>
          🔄 <span className="label" style={{ marginLeft: 6 }}>Atualizar</span>
        </button>
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: "1px solid var(--border)",
  fontWeight: 700,
  fontSize: ".95rem",
};
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };
