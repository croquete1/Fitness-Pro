// src/app/(app)/dashboard/admin/approvals/page.tsx
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

type SortKey = "name" | "email" | "role" | "createdAt";
type SortDir = "asc" | "desc";

export default function ApprovalsPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [roleEdits, setRoleEdits] = React.useState<Record<string, RoleOpt>>({});

  // filtros/ordenação
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"" | RoleOpt>("");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/approvals", { cache: "no-store" });
    const j = await res.json();
    const list: Row[] = Array.isArray(j?.data) ? j.data : [];
    setRows(list);
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
    } catch {
      setRows(prevRows);
      alert("Não foi possível executar a ação. Tenta novamente.");
    } finally {
      setSavingId(null);
    }
  }

  // ---------- filtrar + ordenar ----------
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = (rows ?? []).filter((r) => {
      const passRole = roleFilter ? r.role === roleFilter : true;
      const passQuery =
        !q ||
        r.email.toLowerCase().includes(q) ||
        (r.name ?? "").toLowerCase().includes(q);
      return passRole && passQuery;
    });

    const cmp = (a: Row, b: Row) => {
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortKey) {
        case "name": va = (a.name ?? "").toLowerCase(); vb = (b.name ?? "").toLowerCase(); break;
        case "email": va = a.email.toLowerCase(); vb = b.email.toLowerCase(); break;
        case "role": va = a.role; vb = b.role; break;
        case "createdAt": va = +new Date(a.createdAt); vb = +new Date(b.createdAt); break;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    };
    return arr.sort(cmp);
  }, [rows, query, roleFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "createdAt" ? "desc" : "asc"); }
  }

  const sortIcon = (key: SortKey) =>
    key !== sortKey ? "↕" : sortDir === "asc" ? "↑" : "↓";

  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>
        Aprovações de Conta
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Pesquisa, filtra e define a função antes de aprovar/rejeitar.
      </p>

      {/* Filtros */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        marginBottom: 12, flexWrap: "wrap"
      }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por nome ou email…"
          style={{
            border: "1px solid var(--border)", borderRadius: 8,
            padding: "8px 10px", minWidth: 260, background: "transparent", color: "inherit"
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "" | RoleOpt)}
          style={{
            border: "1px solid var(--border)", borderRadius: 8,
            padding: "8px 10px", background: "transparent", color: "inherit"
          }}
          aria-label="Filtrar por função"
        >
          <option value="">Todas as funções</option>
          <option value="CLIENT">Cliente</option>
          <option value="TRAINER">Personal Trainer</option>
        </select>
        <div style={{ marginLeft: "auto", color: "var(--muted)" }}>
          {filtered.length} resultado(s)
        </div>
      </div>

      {/* Tabela */}
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
              <Th onClick={() => toggleSort("name")} icon={sortIcon("name")}>Nome</Th>
              <Th onClick={() => toggleSort("email")} icon={sortIcon("email")}>Email</Th>
              <Th onClick={() => toggleSort("role")} icon={sortIcon("role")}>Função (editar)</Th>
              <Th onClick={() => toggleSort("createdAt")} icon={sortIcon("createdAt")}>Criado em</Th>
              <th style={{ ...th, textAlign: "right", cursor: "default" }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr><td colSpan={5} style={td}>A carregar…</td></tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={td}>
                  <div style={{ padding: "18px 0", color: "var(--muted)" }}>
                    Sem resultados.
                  </div>
                </td>
              </tr>
            )}

            {filtered.map((u) => {
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

function Th({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon: string; }) {
  return (
    <th onClick={onClick} style={{ ...th, cursor: "pointer", userSelect: "none" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {children} <span aria-hidden style={{ color: "var(--muted)" }}>{icon}</span>
      </span>
    </th>
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
