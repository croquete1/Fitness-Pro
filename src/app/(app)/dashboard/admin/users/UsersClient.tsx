"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/ui/Modal";

type Role = "ADMIN" | "TRAINER" | "CLIENT" | string;
type Status = "PENDING" | "ACTIVE" | "SUSPENDED" | string;

type UserRow = {
  id: string;
  name: string;
  email?: string;
  role?: Role;
  status?: Status;
  createdAt?: string;
  lastLoginAt?: string;
  meta?: any;
};

type PageResult = { items: any[]; total?: number };

async function fetchFirstOkPaged(page: number, limit: number): Promise<PageResult> {
  const urls = [
    `/api/admin/users?page=${page}&limit=${limit}`,
    `/api/users?page=${page}&limit=${limit}`,
    `/api/admin/clients?page=${page}&limit=${limit}`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { credentials: "include" });
      if (r.ok) {
        const total = Number(r.headers.get("x-total-count") ?? "") || undefined;
        const j = await r.json();
        if (Array.isArray(j)) return { items: j, total };
        if (Array.isArray(j?.data)) return { items: j.data, total: j.total ?? total };
        if (Array.isArray(j?.users)) return { items: j.users, total: j.total ?? total };
      }
    } catch {}
  }
  // última tentativa: endpoint sem paginação
  for (const u of ["/api/admin/users", "/api/users", "/api/admin/clients"]) {
    try {
      const r = await fetch(u, { credentials: "include" });
      if (r.ok) {
        const j = await r.json();
        const arr = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : (Array.isArray(j?.users) ? j.users : []));
        const start = (page - 1) * limit;
        return { items: arr.slice(start, start + limit), total: arr.length };
      }
    } catch {}
  }
  return { items: [], total: 0 };
}

function coerceUsers(items: any[]): UserRow[] {
  return items.map((x, i) => ({
    id: String(x.id ?? x.userId ?? i),
    name: String(x.name ?? x.fullName ?? x.username ?? "—"),
    email: x.email ?? x.mail ?? undefined,
    role: (x.role ?? x.type ?? x.kind ?? undefined) as Role,
    status: (x.status ?? x.state ?? undefined) as Status,
    createdAt: x.createdAt ?? x.created_at ?? x.when ?? undefined,
    lastLoginAt: x.lastLoginAt ?? x.last_login_at ?? x.lastSeenAt ?? undefined,
    meta: x,
  }));
}

async function tryPost(id: string, payload: any) {
  const bodies = [
    { url: `/api/admin/users/${id}/status`, method: "POST", body: payload },
    { url: `/api/admin/users/update`, method: "POST", body: { id, ...payload } },
    { url: `/api/admin/users/${id}`, method: "PATCH", body: payload },
  ];
  for (const b of bodies) {
    try {
      const r = await fetch(b.url, {
        method: b.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b.body),
        credentials: "include",
      });
      if (r.ok) return await r.json().catch(() => ({}));
    } catch {}
  }
  throw new Error("Falha ao comunicar com o servidor");
}

export default function UsersClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [all, setAll] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [role, setRole] = useState<Role | "ALL">((sp.get("role") as any) ?? "ALL");
  const [page, setPage] = useState<number>(Number(sp.get("page") ?? 1) || 1);
  const [limit, setLimit] = useState<number>(Number(sp.get("limit") ?? 20) || 20);
  const [total, setTotal] = useState<number>(0);

  // dialogs
  const [viewU, setViewU] = useState<UserRow | null>(null);
  const [editU, setEditU] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  // carregar página
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchFirstOkPaged(page, limit);
      setAll(coerceUsers(res.items));
      setTotal(res.total ?? res.items.length);
      setLoading(false);
    })();
  }, [page, limit]);

  // sincronizar URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "ALL") params.set("role", String(role));
    if (page !== 1) params.set("page", String(page));
    if (limit !== 20) params.set("limit", String(limit));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : ""); // query-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role, page, limit]);

  const view = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter(u => {
      const okRole = role === "ALL" ? true : (u.role ?? "").toUpperCase().includes(String(role));
      const okQ = !t
        ? true
        : (u.name?.toLowerCase().includes(t) ||
           (u.email ?? "").toLowerCase().includes(t) ||
           (u.role ?? "").toLowerCase().includes(t));
      return okRole && okQ;
    });
  }, [all, q, role]);

  const pageCount = Math.max(1, Math.ceil((total || view.length || 0) / limit));

  const changeStatus = async (u: UserRow, status: Status) => {
    setBusy(true);
    try {
      await tryPost(u.id, { status });
      // otimista
      setAll(list => list.map(x => x.id === u.id ? { ...x, status } : x));
      setEditU(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (u: UserRow, newRole: Role) => {
    setBusy(true);
    try {
      await tryPost(u.id, { role: newRole });
      setAll(list => list.map(x => x.id === u.id ? { ...x, role: newRole } : x));
      setEditU(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 12, height: "100%" }}>
      <h1 style={{ margin: 0 }}>Utilizadores</h1>

      <div className="card" style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="search"
            placeholder="Pesquisar por nome, email ou role…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            style={{
              minWidth: 240,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--fg)",
              outline: "none",
            }}
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value as any); setPage(1); }}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--fg)",
              outline: "none",
            }}
          >
            <option value="ALL">Todos</option>
            <option value="TRAINER">Personal Trainers</option>
            <option value="CLIENT">Clientes</option>
            <option value="ADMIN">Admins</option>
          </select>

          <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {view.length} itens nesta página • {total || view.length} total
            </span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              aria-label="Itens por página"
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)" }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--selection)" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 12 }}>Nome</th>
              <th style={{ textAlign: "left", padding: 12 }}>Email</th>
              <th style={{ textAlign: "left", padding: 12 }}>Role</th>
              <th style={{ textAlign: "left", padding: 12 }}>Estado</th>
              <th style={{ textAlign: "left", padding: 12 }}>Criado</th>
              <th style={{ textAlign: "left", padding: 12 }}>Último acesso</th>
              <th style={{ textAlign: "right", padding: 12, width: 140 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: 16 }} className="text-muted">A carregar…</td></tr>
            )}
            {!loading && view.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 16 }} className="text-muted">Sem resultados.</td></tr>
            )}
            {view.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: 12, fontWeight: 700 }}>{u.name}</td>
                <td style={{ padding: 12 }}>{u.email ?? "—"}</td>
                <td style={{ padding: 12 }}>{u.role ?? "—"}</td>
                <td style={{ padding: 12 }}>
                  <span className={`badge${u.status === "ACTIVE" ? "-success" : u.status === "PENDING" ? "" : "-danger"}`}>
                    {u.status ?? "—"}
                  </span>
                </td>
                <td style={{ padding: 12 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                <td style={{ padding: 12 }}>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button className="pill" onClick={() => setViewU(u)} style={{ padding: "6px 10px" }}>Ver</button>
                    <button className="pill" onClick={() => setEditU(u)} style={{ padding: "6px 10px" }}>Editar</button>
                    <button
                      className="pill"
                      onClick={() => changeStatus(u, u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED")}
                      style={{ padding: "6px 10px", borderColor: "transparent", background: "var(--brand)", color: "#fff" }}
                    >
                      {u.status === "SUSPENDED" ? "Ativar" : "Suspender"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* paginação */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
        <button className="pill" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Anterior</button>
        <span className="text-muted" style={{ fontSize: 12 }}>Página {page} de {pageCount}</span>
        <button className="pill" disabled={page>=pageCount} onClick={() => setPage(p => Math.min(pageCount, p+1))}>Seguinte</button>
      </div>

      {/* Modal Ver */}
      <Modal open={!!viewU} onClose={() => setViewU(null)} title={viewU?.name ?? "Utilizador"}>
        <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
          <div><b>Nome:</b> {viewU?.name}</div>
          <div><b>Email:</b> {viewU?.email ?? "—"}</div>
          <div><b>Role:</b> {viewU?.role ?? "—"}</div>
          <div><b>Estado:</b> {viewU?.status ?? "—"}</div>
          <div><b>Criado:</b> {viewU?.createdAt ? new Date(viewU.createdAt).toLocaleString() : "—"}</div>
          <div><b>Último acesso:</b> {viewU?.lastLoginAt ? new Date(viewU.lastLoginAt).toLocaleString() : "—"}</div>
          {viewU?.meta && (
            <pre style={{ background: "var(--selection)", padding: 8, borderRadius: 8, overflow: "auto" }}>
              {JSON.stringify(viewU.meta, null, 2)}
            </pre>
          )}
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal
        open={!!editU}
        onClose={() => setEditU(null)}
        title={editU ? `Editar: ${editU.name}` : "Editar"}
        footer={
          <>
            <button className="pill" onClick={() => setEditU(null)}>Cancelar</button>
            <button className="pill" disabled={busy}
              onClick={() => {
                const form = document.getElementById("user-edit-form") as HTMLFormElement | null;
                if (!form) return;
                const data = new FormData(form);
                const newRole = (data.get("role") as string) as Role;
                const newStatus = (data.get("status") as string) as Status;
                if (editU) {
                  if (newRole !== editU.role) changeRole(editU, newRole);
                  if (newStatus !== editU.status) changeStatus(editU, newStatus);
                }
              }}
              style={{ borderColor: "transparent", background: "var(--brand)", color: "#fff" }}
            >
              {busy ? "A guardar…" : "Guardar"}
            </button>
          </>
        }
      >
        {editU && (
          <form id="user-edit-form" style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Role</span>
              <select name="role" defaultValue={editU.role ?? "CLIENT"} style={{
                padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)"
              }}>
                <option value="CLIENT">Cliente</option>
                <option value="TRAINER">Personal Trainer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Estado</span>
              <select name="status" defaultValue={editU.status ?? "ACTIVE"} style={{
                padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)"
              }}>
                <option value="ACTIVE">Ativo</option>
                <option value="PENDING">Pendente</option>
                <option value="SUSPENDED">Suspenso</option>
              </select>
            </label>
          </form>
        )}
      </Modal>
    </div>
  );
}
