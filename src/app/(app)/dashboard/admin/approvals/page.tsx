"use client";

import * as React from "react";

type RoleOpt = "TRAINER" | "CLIENT";
type Row = {
  id: string;
  email: string;
  name: string | null;
  role: RoleOpt;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

export default function ApprovalsPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  // mapa de edições de role por id
  const [roleEdits, setRoleEdits] = React.useState<Record<string, RoleOpt>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/approvals", { cache: "no-store" });
    const j = await res.json();
    const list: Row[] = Array.isArray(j?.data) ? j.data : [];
    setRows(list);
    // inicializa mapa de roles
    const m: Record<string, RoleOpt> = {};
    for (const r of list) m[r.id] = r.role;
    setRoleEdits(m);
    setLoading(false);
  }

  React.useEffect(() => { void load(); }, []);

  function updateLocalRole(id: string, r: RoleOpt) {
    setRoleEdits((m) => ({ ...m, [id]: r }));
  }

  async function act(id: string, action: "approve" | "reject") {
    const current = (rows ?? []).find((x) => x.id === id);
    if (!current) return;

    const newRole = roleEdits[id] ?? current.role;

    // otimista: remove linha
    const prevRows = rows ?? [];
    setRows(prevRows.filter((x) => x.id !== id));
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, newRole }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      // rollback
      setRows(prevRows);
      alert("Não foi possível executar a ação. Tenta novamente.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>
        Aprovações de Conta
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Lista em tempo real de contas pendentes (dados via API). Podes alterar a função antes de aprovar ou rejeitar.
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
              <th style={th}>Função (editar)</th>
              <th style={th}>Criado em</th>
              <th style={{ ...th, textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={td}>A carregar…</td>
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

            {(rows ?? []).map((u) => {
              const value = roleEdits[u.id] ?? u.role;
              const disabled = savingId === u.id;
              return (
                <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={td}>{u.name ?? "—"}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>
                    <select
                      value={value}
                      onChange={(e) => updateLocalRole(u.id, e.target.value as RoleOpt)}
                      disabled={disabled}
                      aria-label="Alterar função"
                      style={{
                        border: "1px solid var(--border)",
                        background: "transparent",
                        borderRadius: 8,
                        padding: "6px 8px",
                        color: "inherit",
                      }}
                    >
                      <option value="CLIENT">Cliente</option>
                      <option value="TRAINER">Personal Trainer</option>
                    </select>
                  </td>
                  <td style={td}>{new Date(u.createdAt).toLocaleString("pt-PT")}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <button
                        className="fp-pill"
                        onClick={() => act(u.id, "approve")}
                        disabled={disabled}
                        title="Aprovar"
                      >
                        ✅ <span className="label" style={{ marginLeft: 6 }}>Aprovar</span>
                      </button>
                      <button
                        className="fp-pill"
                        onClick={() => act(u.id, "reject")}
                        disabled={disabled}
                        title="Rejeitar"
                      >
                        ✖️ <span className="label" style={{ marginLeft: 6 }}>Rejeitar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
