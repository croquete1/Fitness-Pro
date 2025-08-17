"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Role = "ADMIN" | "TRAINER" | "CLIENT";
type Status = "PENDING" | "ACTIVE" | "SUSPENDED";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  status: Status;
  createdAt?: string | null;
  lastLoginAt?: string | null;
};

type UsersResponse = {
  data: User[];
  total?: number;
};

const PAGE_SIZE = 10;

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "danger" | "warning" }) {
  const bg =
    tone === "success" ? "var(--green-600, #16a34a)" :
    tone === "danger" ? "var(--red-600, #dc2626)" :
    tone === "warning" ? "var(--amber-600, #d97706)" :
    "var(--brand, #3b82f6)";
  return (
    <span
      className="badge"
      style={{
        background: bg,
        color: "#fff",
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const tone = status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "danger" : "warning";
  return <Badge tone={tone}>{status}</Badge>;
}

export default function UsersClient() {
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Record<string, Partial<User>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce de pesquisa
  const searchTimer = useRef<number | null>(null);
  const onChangeQ = (v: string) => {
    setQ(v);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(0);
      load(0, v, role, status);
    }, 250);
  };

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(page * PAGE_SIZE));
    if (q.trim()) p.set("q", q.trim());
    if (role !== "ALL") p.set("role", role);
    if (status !== "ALL") p.set("status", status);
    return p;
  }, [page, q, role, status]);

  const load = useCallback(
    async (p = page, query = q, r: Role | "ALL" = role, s: Status | "ALL" = status) => {
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams();
        sp.set("limit", String(PAGE_SIZE));
        sp.set("offset", String(p * PAGE_SIZE));
        if (query.trim()) sp.set("q", query.trim());
        if (r !== "ALL") sp.set("role", r);
        if (s !== "ALL") sp.set("status", s);

        const resp = await fetch(`/api/admin/users?${sp.toString()}`, { cache: "no-store" });
        if (!resp.ok) throw new Error(`GET /api/admin/users falhou (${resp.status})`);
        const json: UsersResponse = await resp.json();
        setRows(Array.isArray(json.data) ? json.data : []);
        setTotal(Number(json.total ?? (Array.isArray(json.data) ? json.data.length : 0)));
      } catch (e: any) {
        setRows([]);
        setTotal(0);
        setError(e?.message ?? "Erro ao carregar utilizadores");
      } finally {
        setLoading(false);
      }
    },
    [page, q, role, status]
  );

  useEffect(() => {
    // carregar na montagem e quando muda a paginação/filtros
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function startEdit(u: User) {
    setEditing((m) => ({ ...m, [u.id]: { name: u.name ?? "", email: u.email ?? "", role: u.role, status: u.status } }));
  }
  function cancelEdit(id: string) {
    setEditing((m) => {
      const n = { ...m };
      delete n[id];
      return n;
    });
  }

  async function saveEdit(id: string) {
    const patch = editing[id];
    if (!patch) return;
    setSavingId(id);
    setError(null);
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!resp.ok) throw new Error(`PATCH falhou (${resp.status})`);
      cancelEdit(id);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao guardar alterações");
    } finally {
      setSavingId(null);
    }
  }

  async function changeRole(id: string, newRole: Role) {
    setSavingId(id);
    setError(null);
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!resp.ok) throw new Error(`PATCH role falhou (${resp.status})`);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao alterar role");
    } finally {
      setSavingId(null);
    }
  }

  async function changeStatus(id: string, newStatus: Status) {
    setSavingId(id);
    setError(null);
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!resp.ok) throw new Error(`PATCH status falhou (${resp.status})`);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao alterar estado");
    } finally {
      setSavingId(null);
    }
  }

  async function approve(id: string) {
    setSavingId(id);
    setError(null);
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(id)}/approve`, { method: "POST" });
      if (!resp.ok) throw new Error(`approve falhou (${resp.status})`);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao aprovar utilizador");
    } finally {
      setSavingId(null);
    }
  }

  async function reject(id: string) {
    setSavingId(id);
    setError(null);
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(id)}/reject`, { method: "POST" });
      if (!resp.ok) throw new Error(`reject falhou (${resp.status})`);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao rejeitar utilizador");
    } finally {
      setSavingId(null);
    }
  }

  const headerRight = (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input
        type="search"
        placeholder="Pesquisar por nome ou email…"
        aria-label="Pesquisar utilizadores"
        defaultValue={q}
        onChange={(e) => onChangeQ(e.target.value)}
        className="pill"
        style={{ padding: "10px 12px", minWidth: 260 }}
      />
      <select
        value={role}
        onChange={(e) => { setRole(e.target.value as any); setPage(0); load(0, q, e.target.value as any, status); }}
        className="pill"
        aria-label="Filtrar por role"
        style={{ padding: "10px 12px" }}
      >
        <option value="ALL">Todos os roles</option>
        <option value="ADMIN">Admin</option>
        <option value="TRAINER">Personal Trainer</option>
        <option value="CLIENT">Cliente</option>
      </select>
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value as any); setPage(0); load(0, q, role, e.target.value as any); }}
        className="pill"
        aria-label="Filtrar por estado"
        style={{ padding: "10px 12px" }}
      >
        <option value="ALL">Todos os estados</option>
        <option value="PENDING">Pendente</option>
        <option value="ACTIVE">Ativo</option>
        <option value="SUSPENDED">Suspenso</option>
      </select>
    </div>
  );

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ margin: 0 }}>Utilizadores</h1>
          <Badge>{total} total</Badge>
          {loading && <span className="text-muted" style={{ fontSize: 12 }}>a carregar…</span>}
        </div>
        {headerRight}
      </div>

      {error && (
        <div className="badge-danger" style={{ padding: 8, borderRadius: 10 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr className="text-muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: .3 }}>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Nome</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Email</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Role</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Estado</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Criado</th>
              <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Último acesso</th>
              <th style={{ textAlign: "right", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 16, textAlign: "center" }} className="text-muted">
                  Sem resultados para os filtros atuais.
                </td>
              </tr>
            )}
            {rows.map((u) => {
              const edit = editing[u.id];
              const isSaving = savingId === u.id;

              return (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px" }}>
                    {edit ? (
                      <input
                        value={edit.name ?? ""}
                        onChange={(e) => setEditing(m => ({ ...m, [u.id]: { ...m[u.id], name: e.target.value } }))}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <strong>{u.name ?? "—"}</strong>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {edit ? (
                      <input
                        value={edit.email ?? ""}
                        onChange={(e) => setEditing(m => ({ ...m, [u.id]: { ...m[u.id], email: e.target.value } }))}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <span>{u.email ?? "—"}</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {edit ? (
                      <select
                        value={(edit.role ?? u.role) as Role}
                        onChange={(e) => setEditing(m => ({ ...m, [u.id]: { ...m[u.id], role: e.target.value as Role } }))}
                        className="pill"
                        style={{ padding: "6px 8px" }}
                      >
                        <option value="CLIENT">Cliente</option>
                        <option value="TRAINER">Personal Trainer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <Badge>{u.role}</Badge>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {edit ? (
                      <select
                        value={(edit.status ?? u.status) as Status}
                        onChange={(e) => setEditing(m => ({ ...m, [u.id]: { ...m[u.id], status: e.target.value as Status } }))}
                        className="pill"
                        style={{ padding: "6px 8px" }}
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="ACTIVE">Ativo</option>
                        <option value="SUSPENDED">Suspenso</option>
                      </select>
                    ) : (
                      <StatusPill status={u.status} />
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {edit ? (
                        <>
                          <button
                            className="pill"
                            onClick={() => saveEdit(u.id)}
                            disabled={isSaving}
                            style={{ padding: "6px 10px", background: "var(--brand)", color: "#fff", borderColor: "transparent" }}
                          >
                            {isSaving ? "A guardar…" : "Guardar"}
                          </button>
                          <button className="pill" onClick={() => cancelEdit(u.id)} disabled={isSaving} style={{ padding: "6px 10px" }}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="pill" onClick={() => startEdit(u)} style={{ padding: "6px 10px" }}>
                            Editar
                          </button>

                          {/* Role rápido (sem entrar em modo edição) */}
                          <select
                            title="Alterar role"
                            value={u.role}
                            onChange={(e) => changeRole(u.id, e.target.value as Role)}
                            disabled={isSaving}
                            className="pill"
                            style={{ padding: "6px 8px" }}
                          >
                            <option value="CLIENT">Cliente</option>
                            <option value="TRAINER">PT</option>
                            <option value="ADMIN">Admin</option>
                          </select>

                          {/* Ativar / Suspender */}
                          {u.status !== "ACTIVE" ? (
                            <button className="pill" onClick={() => changeStatus(u.id, "ACTIVE")} disabled={isSaving} style={{ padding: "6px 10px" }}>
                              Ativar
                            </button>
                          ) : (
                            <button className="pill" onClick={() => changeStatus(u.id, "SUSPENDED")} disabled={isSaving} style={{ padding: "6px 10px" }}>
                              Suspender
                            </button>
                          )}

                          {/* Aprovar / Rejeitar (para pendentes) */}
                          {u.status === "PENDING" && (
                            <>
                              <button className="pill" onClick={() => approve(u.id)} disabled={isSaving} style={{ padding: "6px 10px" }}>
                                Aprovar
                              </button>
                              <button className="pill" onClick={() => reject(u.id)} disabled={isSaving} style={{ padding: "6px 10px" }}>
                                Rejeitar
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div className="text-muted" style={{ fontSize: 12 }}>
          Página {page + 1} de {totalPages} • {total} registo(s)
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="pill"
            onClick={() => { const np = Math.max(0, page - 1); setPage(np); load(np, q, role, status); }}
            disabled={page === 0 || loading}
            style={{ padding: "6px 10px" }}
          >
            Anterior
          </button>
          <button
            className="pill"
            onClick={() => { const np = Math.min(totalPages - 1, page + 1); setPage(np); load(np, q, role, status); }}
            disabled={page >= totalPages - 1 || loading}
            style={{ padding: "6px 10px" }}
          >
            Seguinte
          </button>
        </div>
      </div>
    </div>
  );
}
