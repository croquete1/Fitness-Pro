'use client';

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "@/components/ui/Toaster"; // ✅ usar toast direto

type Row = { id: string; name: string | null; email: string | null; role: string; status: string; createdAt: string };

export default function UsersClient({ initial, total, pageSize }: { initial: Row[]; total: number; pageSize: number }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [isPending, start] = useTransition();

  const pages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  async function refetch(p = page) {
    const q = new URLSearchParams({
      page: String(p),
      perPage: String(pageSize),
      search,
      role,
      status,
      sort: "desc",
    });
    const res = await fetch(`/api/admin/users?${q}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setRows(json.rows);
    }
  }

  useEffect(() => {
    start(() => refetch(1));
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status]);

  async function update(id: string, patch: Partial<Pick<Row, "role" | "status">>) {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    const res = await fetch(`/api/admin/users`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (!res.ok) {
      setRows(prev);
      toast("Falha ao atualizar ⚠️");
    } else {
      toast("Atualizado ✅");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Apagar este utilizador?")) return;
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id)); // UI otimista
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setRows(prev);
      toast("Falha ao apagar ⚠️");
    } else {
      toast("Utilizador apagado 🗑️");
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>👥 Utilizadores</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          placeholder="Pesquisar nome/email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ minWidth: 220 }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
          <option value="">Todos os perfis</option>
          <option value="CLIENT">Cliente</option>
          <option value="TRAINER">Personal Trainer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
          <option value="">Todos os estados</option>
          <option value="ACTIVE">Ativo</option>
          <option value="PENDING">Pendente</option>
          <option value="SUSPENDED">Suspenso</option>
        </select>
      </div>

      <div style={{ overflow: "auto" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Nome</th>
              <th style={{ textAlign: "left", padding: 8 }}>Email</th>
              <th style={{ textAlign: "left", padding: 8 }}>Perfil</th>
              <th style={{ textAlign: "left", padding: 8 }}>Estado</th>
              <th style={{ textAlign: "left", padding: 8 }}>Criado em</th>
              <th style={{ textAlign: "right", padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{r.name ?? "—"}</td>
                <td style={{ padding: 8 }}>{r.email ?? "—"}</td>
                <td style={{ padding: 8 }}>
                  <select
                    className="input"
                    value={r.role}
                    disabled={isPending}
                    onChange={(e) => update(r.id, { role: e.target.value })}
                  >
                    <option value="CLIENT">Cliente</option>
                    <option value="TRAINER">Personal Trainer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    className="input"
                    value={r.status}
                    disabled={isPending}
                    onChange={(e) => update(r.id, { status: e.target.value })}
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="PENDING">Pendente</option>
                    <option value="SUSPENDED">Suspenso</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>{new Date(r.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <a href={`/dashboard/admin/users/${r.id}`} className="btn btn-sm" title="Editar utilizador">
                    ✏️ Editar
                  </a>
                  <button className="btn btn-sm" title="Apagar utilizador" onClick={() => onDelete(r.id)} style={{ marginLeft: 8 }}>
                    🗑️ Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <button className="btn" disabled={page <= 1} onClick={() => start(() => (setPage((p) => p - 1), refetch(page - 1)))}>
          ◀
        </button>
        <div>Página {page}</div>
        <button
          className="btn"
          disabled={page >= pages}
          onClick={() => start(() => (setPage((p) => p + 1), refetch(page + 1)))}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
