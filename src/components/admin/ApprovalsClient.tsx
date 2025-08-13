// src/components/admin/ApprovalsClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  X,
  Search,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  ShieldX,
  Loader2,
} from "lucide-react";

type Item = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string; // ISO
  role: "ADMIN" | "TRAINER" | "CLIENT" | string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED" | string;
};

type ApiResp = {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
};

const PAGE_SIZE = 10;

/* ---------------- Toast minimalista, sem deps ---------------- */
type Toast = { id: string; type: "success" | "error" | "info"; text: string };
function Toasts({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] mx-auto flex w-full max-w-xl flex-col gap-2 px-4 sm:right-4 sm:top-4 sm:items-end sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-2xl border p-3 shadow-lg backdrop-blur transition-all ${
            t.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              : t.type === "error"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                : "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200"
          }`}
        >
          {t.type === "success" ? (
            <ShieldCheck className="mt-0.5 h-5 w-5" />
          ) : t.type === "error" ? (
            <ShieldX className="mt-0.5 h-5 w-5" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5" />
          )}
          <div className="flex-1 text-sm">{t.text}</div>
          <button
            onClick={() => onClose(t.id)}
            className="rounded-md px-2 text-sm/none opacity-75 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function push(type: Toast["type"], text: string) {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    // auto-dismiss em 4.2s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }
  function close(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }
  return { toasts, push, close };
}

/* ---------------- Helpers de UI ---------------- */
function roleBadge(role: Item["role"]) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
  switch (role) {
    case "ADMIN":
      return <span className={`${base} bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300`}>ADMIN</span>;
    case "TRAINER":
      return <span className={`${base} bg-amber-500/15 text-amber-600 dark:text-amber-300`}>TRAINER</span>;
    case "CLIENT":
      return <span className={`${base} bg-sky-500/15 text-sky-600 dark:text-sky-300`}>CLIENT</span>;
    default:
      return <span className={`${base} bg-muted text-muted-foreground`}>{role}</span>;
  }
}
function statusBadge(status: Item["status"]) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
  switch (status) {
    case "PENDING":
      return <span className={`${base} bg-yellow-500/15 text-yellow-700 dark:text-yellow-300`}>PENDENTE</span>;
    case "APPROVED":
      return <span className={`${base} bg-emerald-500/15 text-emerald-700 dark:text-emerald-300`}>APROVADA</span>;
    case "REJECTED":
      return <span className={`${base} bg-rose-500/15 text-rose-700 dark:text-rose-300`}>REJEITADA</span>;
    case "BLOCKED":
      return <span className={`${base} bg-neutral-500/15 text-neutral-700 dark:text-neutral-300`}>BLOQUEADA</span>;
    default:
      return <span className={`${base} bg-muted text-muted-foreground`}>{status}</span>;
  }
}
function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

/* ---------------- Componente principal ---------------- */
export default function ApprovalsClient() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null); // spinner por linha

  const { toasts, push, close } = useToasts();
  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const abortRef = useRef<AbortController | null>(null);

  async function fetchData(opts?: { resetPage?: boolean }) {
    setError(null);
    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const params = new URLSearchParams({
        page: String(opts?.resetPage ? 1 : page),
        pageSize: String(pageSize),
      });
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/admin/approvals?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Erro ${res.status}`);
      }
      const data = (await res.json()) as ApiResp;
      setItems(data.items || []);
      setTotal(data.total || 0);
      if (opts?.resetPage) setPage(1);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar dados.");
      push("error", "Não foi possível carregar as aprovações.");
    } finally {
      setLoading(false);
    }
  }

  async function act(id: string, action: "approve" | "reject") {
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Erro ${res.status}`);
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      push("success", action === "approve" ? "Conta aprovada com sucesso." : "Conta rejeitada.");
    } catch (e: any) {
      push("error", e?.message || "Falha na operação.");
    } finally {
      setBusyId(null);
    }
  }

  // atalho enter para pesquisar
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      fetchData({ resetPage: true });
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  return (
    <>
      <Toasts toasts={toasts} onClose={close} />

      <div className="space-y-4">
        {/* barra de ferramentas */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative w-full sm:w-96">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Procurar por nome ou email…"
                className="w-full rounded-2xl border bg-background/80 px-8 py-2 text-sm outline-none ring-offset-background backdrop-blur focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={() => fetchData({ resetPage: true })}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Procurar
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            {total} pendente{total === 1 ? "" : "s"}
          </div>
        </div>

        {/* banners de erro inline */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* tabela */}
        <div className="overflow-hidden rounded-3xl border bg-card/60 shadow-sm backdrop-blur">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Utilizador</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Perfil</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Registado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      A carregar…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                      <Check className="h-6 w-6" />
                      <p>Sem pedidos pendentes de aprovação.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((it) => (
                  <tr key={it.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="max-w-[220px] truncate font-medium">
                        {it.name || it.email.split("@")[0]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[260px] truncate text-muted-foreground">{it.email}</div>
                    </td>
                    <td className="px-4 py-3">{roleBadge(it.role)}</td>
                    <td className="px-4 py-3">{statusBadge(it.status)}</td>
                    <td className="px-4 py-3">{fmtDate(it.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => act(it.id, "reject")}
                          disabled={busyId === it.id}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-500/15 disabled:opacity-50 dark:text-rose-300"
                        >
                          {busyId === it.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                          Rejeitar
                        </button>
                        <button
                          onClick={() => act(it.id, "approve")}
                          disabled={busyId === it.id}
                          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500/15 disabled:opacity-50 dark:text-emerald-300"
                        >
                          {busyId === it.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Aprovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* paginação */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página <span className="font-medium">{page}</span> de{" "}
            <span className="font-medium">{maxPage}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-2xl border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage || loading}
              className="rounded-2xl border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Seguinte
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
