"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";

type Role = "ADMIN" | "TRAINER" | "CLIENT" | string;
type Status = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | string;

type PendingRow = {
  id: string;
  name: string;
  email?: string;
  requestedRole?: Role;
  status?: Status;          // normalmente "PENDING"
  createdAt?: string;
  meta?: any;
};

type PageResult = { items: any[]; total?: number };

/* =========================
   Utils – fetchers tolerantes
   ========================= */

// tenta endpoints com paginação; se não houver, faz fallback sem paginação
async function fetchFirstOkPaged(page: number, limit: number): Promise<PageResult> {
  const urls = [
    `/api/admin/approvals?page=${page}&limit=${limit}`,
    `/api/admin/users?status=PENDING&page=${page}&limit=${limit}`,
    `/api/admin/pending-users?page=${page}&limit=${limit}`,
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
        if (Array.isArray(j?.pending)) return { items: j.pending, total: j.total ?? total };
      }
    } catch {}
  }
  for (const u of ["/api/admin/approvals", "/api/admin/users?status=PENDING", "/api/admin/pending-users"]) {
    try {
      const r = await fetch(u, { credentials: "include" });
      if (r.ok) {
        const j = await r.json();
        const arr =
          Array.isArray(j) ? j :
          Array.isArray(j?.data) ? j.data :
          Array.isArray(j?.users) ? j.users :
          Array.isArray(j?.pending) ? j.pending : [];
        const start = (page - 1) * limit;
        return { items: arr.slice(start, start + limit), total: arr.length };
      }
    } catch {}
  }
  return { items: [], total: 0 };
}

function coerce(items: any[]): PendingRow[] {
  return items.map((x: any, i: number) => ({
    id: String(x.id ?? x.userId ?? x._id ?? i),
    name: String(x.name ?? x.fullName ?? x.username ?? "—"),
    email: x.email ?? x.mail ?? undefined,
    requestedRole: (x.requestedRole ?? x.role ?? x.type ?? "CLIENT") as Role,
    status: (x.status ?? x.state ?? "PENDING") as Status,
    createdAt: x.createdAt ?? x.created_at ?? x.when ?? undefined,
    meta: x,
  }));
}

async function postApprove(id: string, role: Role) {
  const bodies = [
    { url: `/api/admin/approvals/${id}/approve`, method: "POST", body: { role } },
    { url: `/api/admin/users/${id}/status`, method: "POST", body: { status: "ACTIVE", role } },
    { url: `/api/admin/users/${id}`, method: "PATCH", body: { status: "ACTIVE", role } },
  ];
  for (const b of bodies) {
    try {
      const r = await fetch(b.url, {
        method: b.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(b.body),
      });
      if (r.ok) return await r.json().catch(() => ({}));
    } catch {}
  }
  throw new Error("Falha ao aprovar utilizador.");
}

async function postReject(id: string, reason?: string) {
  const bodies = [
    { url: `/api/admin/approvals/${id}/reject`, method: "POST", body: { reason } },
    { url: `/api/admin/users/${id}/status`, method: "POST", body: { status: "SUSPENDED", reason } },
    { url: `/api/admin/users/${id}`, method: "PATCH", body: { status: "SUSPENDED", reason } },
  ];
  for (const b of bodies) {
    try {
      const r = await fetch(b.url, {
        method: b.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(b.body),
      });
      if (r.ok) return await r.json().catch(() => ({}));
    } catch {}
  }
  throw new Error("Falha ao rejeitar pedido.");
}

/* =========================
   Componente
   ========================= */

export default function ApprovalsClient() {
  // estado base
  const [items, setItems] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [viewU, setViewU] = useState<PendingRow | null>(null);
  const [editU, setEditU] = useState<PendingRow | null>(null);
  const [approveRole, setApproveRole] = useState<Role>("CLIENT");
  const [busy, setBusy] = useState(false);

  // carregar página
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchFirstOkPaged(page, limit);
      if (!cancelled) {
        setItems(coerce(res.items));
        setTotal(res.total ?? res.items.length);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, limit]);

  // SSE (tempo-real) → /api/admin/approvals/stream | /api/events?topic=approvals
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    const candidates = ["/api/admin/approvals/stream", "/api/events?topic=approvals"];
    let opened = false;
    for (const url of candidates) {
      try {
        const es = new EventSource(url, { withCredentials: true });
        es.onmessage = (ev) => {
          opened = true;
          try {
            const data = JSON.parse(ev.data);
            // aceitar tanto 1 item como arrays
            const arr = Array.isArray(data) ? data : [data];
            setItems((current) => {
              const map = new Map(current.map(x => [x.id, x]));
              for (const raw of arr) {
                const p = coerce([raw])[0];
                if (p.status && String(p.status).toUpperCase() !== "PENDING") {
                  map.delete(p.id); // saiu da lista
                } else {
                  map.set(p.id, { ...(map.get(p.id) ?? p), ...p });
                }
              }
              return Array.from(map.values());
            });
          } catch {}
        };
        es.onerror = () => { /* silencioso: se falhar, polling assume */ };
        esRef.current = es;
        break;
      } catch {}
    }
    // fallback: pequeno polling se nenhum SSE abriu
    let poll: any;
    poll = setInterval(async () => {
      if (opened) return; // SSE a funcionar
      try {
        const res = await fetchFirstOkPaged(page, limit);
        setItems(coerce(res.items));
        setTotal(res.total ?? res.items.length);
      } catch {}
    }, 10000);
    return () => {
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      clearInterval(poll);
    };
  }, [page, limit]);

  const view = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter(u => {
      const okRole = role === "ALL" ? true : (u.requestedRole ?? "").toUpperCase().includes(String(role));
      const okQ = !t
        ? true
        : (u.name?.toLowerCase().includes(t) ||
           (u.email ?? "").toLowerCase().includes(t) ||
           (u.requestedRole ?? "").toLowerCase().includes(t));
      return okRole && okQ;
    });
  }, [items, q, role]);

  const effectiveTotal = total || view.length || 0;
  const pageCount = Math.max(1, Math.ceil(effectiveTotal / limit));

  const onApprove = async (u: PendingRow, r: Role) => {
    setBusy(true);
    try {
      await postApprove(u.id, r);
      // Otimista: remover da lista
      setItems(list => list.filter(x => x.id !== u.id));
      setEditU(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onReject = async (u: PendingRow, reason?: string) => {
    setBusy(true);
    try {
      await postReject(u.id, reason);
      setItems(list => list.filter(x => x.id !== u.id));
      setEditU(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Aprovações de Conta</h1>

      {/* Filtros */}
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
              {view.length} itens nesta página • {effectiveTotal} total
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

      {/* Tabela */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "var(--selection)" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 12 }}>Nome</th>
              <th style={{ textAlign: "left", padding: 12 }}>Email</th>
              <th style={{ textAlign: "left", padding: 12 }}>Role pedido</th>
              <th style={{ textAlign: "left", padding: 12 }}>Criado</th>
              <th style={{ textAlign: "right", padding: 12, width: 220 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: 16 }} className="text-muted">A carregar…</td></tr>
            )}
            {!loading && view.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 16 }} className="text-muted">Sem pedidos pendentes.</td></tr>
            )}
            {view.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: 12, fontWeight: 700 }}>{u.name}</td>
                <td style={{ padding: 12 }}>{u.email ?? "—"}</td>
                <td style={{ padding: 12 }}>{u.requestedRole ?? "CLIENT"}</td>
                <td style={{ padding: 12 }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button className="pill" onClick={() => setViewU(u)} style={{ padding: "6px 10px" }}>Ver</button>
                    <button className="pill" onClick={() => { setEditU(u); setApproveRole((u.requestedRole as Role) ?? "CLIENT"); }} style={{ padding: "6px 10px" }}>
                      Aprovar / Rejeitar
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
      <Modal open={!!viewU} onClose={() => setViewU(null)} title={viewU?.name ?? "Pedido"}>
        <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
          <div><b>Nome:</b> {viewU?.name}</div>
          <div><b>Email:</b> {viewU?.email ?? "—"}</div>
          <div><b>Role pedido:</b> {viewU?.requestedRole ?? "CLIENT"}</div>
          <div><b>Criado:</b> {viewU?.createdAt ? new Date(viewU.createdAt).toLocaleString() : "—"}</div>
          {viewU?.meta && (
            <pre style={{ background: "var(--selection)", padding: 8, borderRadius: 8, overflow: "auto" }}>
              {JSON.stringify(viewU.meta, null, 2)}
            </pre>
          )}
        </div>
      </Modal>

      {/* Modal Aprovar/Rejeitar */}
      <Modal
        open={!!editU}
        onClose={() => setEditU(null)}
        title={editU ? `Aprovar/Rejeitar: ${editU.name}` : "Aprovar/Rejeitar"}
        footer={
          <>
            <button className="pill" onClick={() => setEditU(null)}>Cancelar</button>
            <button
              className="pill"
              disabled={busy || !editU}
              onClick={() => editU && onReject(editU)}
            >
              {busy ? "A rejeitar…" : "Rejeitar"}
            </button>
            <button
              className="pill"
              disabled={busy || !editU}
              onClick={() => editU && onApprove(editU, approveRole)}
              style={{ borderColor: "transparent", background: "var(--brand)", color: "#fff" }}
            >
              {busy ? "A aprovar…" : "Aprovar"}
            </button>
          </>
        }
      >
        {editU && (
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Role a atribuir</span>
              <select
                value={approveRole}
                onChange={(e) => setApproveRole(e.target.value as Role)}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }}
              >
                <option value="CLIENT">Cliente</option>
                <option value="TRAINER">Personal Trainer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <span className="text-muted" style={{ fontSize: 12 }}>
              Ao aprovar, o estado do utilizador passa para <b>ACTIVE</b> com o papel escolhido.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
}
