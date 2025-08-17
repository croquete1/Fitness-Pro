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

async function apiList(page: number, limit: number, q: string, role: string | null, status: string | null) {
  const p = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) p.set("q", q);
  if (role && role !== "ALL") p.set("role", role);
  if (status && status !== "ALL") p.set("status", status);
  const r = await fetch(`/api/admin/users?${p.toString()}`, { credentials: "include" });
  const j = await r.json();
  const total = Number(r.headers.get("x-total-count") ?? j.total ?? 0);
  return { items: (j.data ?? j) as any[], total };
}

function mapUsers(items: any[]): UserRow[] {
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

async function apiPatch(id: string, payload: any) {
  const r = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!r.ok) throw new Error((await r.json().catch(()=>({error:""}))).error || "Falha ao guardar");
  return r.json();
}
async function apiApprove(id: string) {
  const r = await fetch(`/api/admin/users/${id}/approve`, { method: "POST", credentials: "include" });
  if (!r.ok) throw new Error("Falha ao aprovar");
  return r.json();
}
async function apiReject(id: string, hardDelete = false) {
  const r = await fetch(`/api/admin/users/${id}/reject${hardDelete ? "?delete=1" : ""}`, { method: "POST", credentials: "include" });
  if (!r.ok) throw new Error("Falha ao rejeitar");
  return r.json();
}
async function apiDelete(id: string) {
  const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
  if (!r.ok) throw new Error("Falha ao eliminar");
  return r.json();
}

export default function UsersClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [role, setRole] = useState<Role | "ALL">((sp.get("role") as any) ?? "ALL");
  const [status, setStatus] = useState<Status | "ALL">((sp.get("status") as any) ?? "ALL");
  const [page, setPage] = useState<number>(Number(sp.get("page") ?? 1) || 1);
  const [limit, setLimit] = useState<number>(Number(sp.get("limit") ?? 20) || 20);
  const [total, setTotal] = useState<number>(0);

  // dialogs
  const [viewU, setViewU] = useState<UserRow | null>(null);
  const [editU, setEditU] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { items, total } = await apiList(page, limit, q, role === "ALL" ? null : String(role), status === "ALL" ? null : String(status));
    setRows(mapUsers(items));
    setTotal(total);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, limit, role, status]);
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (role !== "ALL") p.set("role", String(role));
    if (status !== "ALL") p.set("status", String(status));
    if (page !== 1) p.set("page", String(page));
    if (limit !== 20) p.set("limit", String(limit));
    router.replace(p.toString() ? `?${p.toString()}` : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role, status, page, limit]);

  const pageCount = Math.max(1, Math.ceil((total || 0) / limit));
  const view = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(u =>
      u.name?.toLowerCase().includes(t) ||
      (u.email ?? "").toLowerCase().includes(t) ||
      (u.role ?? "").toLowerCase().includes(t)
    );
  }, [rows, q]);

  const saveEdits = async () => {
    if (!editU) return;
    setBusy(true);
    try {
      const form = document.getElementById("user-edit-form") as HTMLFormElement | null;
      const data = new FormData(form!);
      const payload: any = {
        name: String(data.get("name") || editU.name || ""),
        email: String(data.get("email") || editU.email || ""),
        role: String(data.get("role") || editU.role || "CLIENT"),
        status: String(data.get("status") || editU.status || "ACTIVE"),
      };
      await apiPatch(editU.id, payload);
      setRows(list => list.map(x => x.id === editU.id ? { ...x, ...payload } : x));
      setEditU(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const approve = async (u: UserRow) => {
    setBusy(true);
    try {
      await apiApprove(u.id);
      setRows(list => list.map(x => x.id === u.id ? { ...x, status: "ACTIVE" } : x));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const reject = async (u: UserRow, hardDelete = false) => {
    if (hardDelete && !confirm("Eliminar permanentemente este utilizador?")) return;
    setBusy(true);
    try {
      await apiReject(u.id, hardDelete);
      if (hardDelete) setRows(list => list.filter(x => x.id !== u.id));
      else setRows(list => list.map(x => x.id === u.id ? { ...x, status: "SUSPENDED" } : x));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u: UserRow) => {
    setBusy(true);
    try {
      const newStatus: Status = u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
      await apiPatch(u.id, { status: newStatus });
      setRows(list => list.map(x => x.id === u.id ? { ...x, status: newStatus } : x));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (u: UserRow, newRole: Role) => {
    setBusy(true);
    try {
      await apiPatch(u.id, { role: newRole });
      setRows(list => list.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    } catch (e: any) {
      alert(e.message);
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

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--fg)",
              outline: "none",
            }}
          >
            <option value="ALL">Todos estados</option>
            <option value="PENDING">Pendentes</option>
            <option value="ACTIVE">Ativos</option>
            <option value="SUSPENDED">Suspensos</option>
          </select>

          <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
            <span className="text-muted" style={{ fontSize: 12 }}>
              Página {page} / {Math.max(1, Math.ceil((total || 0) / limit))} • {total} total
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
              <th style={{ textAlign: "right", padding: 12, width: 260 }}>Ações</th>
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
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                    <button className="pill" onClick={() => setViewU(u)} style={{ padding: "6px 10px" }}>Ver</button>
                    <button className="pill" onClick={() => setEditU(u)} style={{ padding: "6px 10px" }}>Editar</button>

                    {u.status === "PENDING" ? (
                      <>
                        <button className="pill" onClick={() => approve(u)} style={{ padding: "6px 10px", background: "var(--brand)", color: "#fff", borderColor: "transparent" }}>
                          Aprovar
                        </button>
                        <button className="pill" onClick={() => reject(u, false)} style={{ padding: "6px 10px" }}>
                          Rejeitar
                        </button>
                        <button className="pill" onClick={() => reject(u, true)} style={{ padding: "6px 10px" }}>
                          Rejeitar + Eliminar
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="pill" onClick={() => toggleActive(u)} style={{ padding: "6px 10px" }}>
                          {u.status === "SUSPENDED" ? "Ativar" : "Suspender"}
                        </button>
                        <select
                          aria-label="Mudar role"
                          value={u.role ?? "CLIENT"}
                          onChange={(e) => changeRole(u, e.target.value as Role)}
                          className="pill"
                          style={{ padding: "6px 10px" }}
                        >
                          <option value="CLIENT">Cliente</option>
                          <option value="TRAINER">Personal Trainer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button className="pill" onClick={() => { if (confirm("Eliminar utilizador?")) apiDelete(u.id).then(()=> setRows(list=>list.filter(x=>x.id!==u.id))).catch(e=>alert(e.message)); }} style={{ padding: "6px 10px" }}>
                          Eliminar
                        </button>
                      </>
                    )}
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
              onClick={saveEdits}
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
              <span>Nome</span>
              <input name="name" defaultValue={editU.name} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Email</span>
              <input type="email" name="email" defaultValue={editU.email} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }} />
            </label>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Role</span>
                <select name="role" defaultValue={editU.role ?? "CLIENT"} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }}>
                  <option value="CLIENT">Cliente</option>
                  <option value="TRAINER">Personal Trainer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Estado</span>
                <select name="status" defaultValue={editU.status ?? "ACTIVE"} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="PENDING">Pendente</option>
                  <option value="SUSPENDED">Suspenso</option>
                </select>
              </label>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
