"use client";

import * as React from "react";
import Link from "next/link";
import clsx from "clsx";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

export type Row = {
  id: string;
  title: string | null;
  body?: string | null;
  href?: string | null;
  read: boolean;
  created_at: string | null; // ISO
};

type Props = { rows: Row[] };

type StatusFilter = "all" | "unread" | "read";

export default function NotificationsClient({ rows }: Props) {
  const [data, setData] = React.useState<Row[]>(rows);
  const [total, setTotal] = React.useState<number>(rows.length);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [selection, setSelection] = React.useState<Set<string>>(new Set());
  const [current, setCurrent] = React.useState<Row | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const url = new URL("/api/notifications/list", window.location.origin);
        url.searchParams.set("status", status);
        url.searchParams.set("page", String(page));
        url.searchParams.set("pageSize", String(pageSize));
        if (deferredSearch) url.searchParams.set("q", deferredSearch);
        const response = await fetch(url.toString(), { cache: "no-store" });
        const json = await response.json();
        if (cancelled) return;
        setData(json.items ?? []);
        setTotal(json.total ?? 0);
        setSelection(new Set());
      } catch (error) {
        console.error(error);
        if (cancelled) return;
        setData([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, page, pageSize, deferredSearch]);

  React.useEffect(() => {
    setPage(0);
  }, [status, deferredSearch, pageSize]);

  async function mark(endpoint: "mark-read" | "mark-unread" | "mark-all-read", ids?: string[]) {
    try {
      await fetch(`/api/notifications/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setData((prev) =>
        endpoint === "mark-all-read"
          ? prev.map((row) => ({ ...row, read: true }))
          : prev.map((row) => (ids?.includes(row.id) ? { ...row, read: endpoint === "mark-read" } : row)),
      );
      setSelection(new Set());
      setCurrent((prev) => {
        if (!prev) return prev;
        if (endpoint === "mark-all-read") return { ...prev, read: true };
        if (ids?.includes(prev.id)) {
          if (endpoint === "mark-read") return { ...prev, read: true };
          if (endpoint === "mark-unread") return { ...prev, read: false };
        }
        return prev;
      });
    } catch (error) {
      console.error(error);
    }
  }

  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: "Todos" },
    { value: "unread", label: "Por ler" },
    { value: "read", label: "Lidas" },
  ];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const selectedIds = Array.from(selection);

  React.useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > nextTotalPages - 1) {
      setPage(nextTotalPages - 1);
    }
  }, [total, page, pageSize]);

  const openRow = (row: Row) => {
    setCurrent(row);
    setModalOpen(true);
    if (!row.read) {
      void mark("mark-read", [row.id]);
    }
  };

  const toggleSelection = (id: string, checked: boolean) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <section className="neo-panel space-y-4" aria-labelledby="notifications-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 id="notifications-heading" className="neo-panel__title">
              Centro de notificações
            </h1>
            <p className="neo-panel__subtitle">Revê alertas recentes e marca como lidas ou por ler.</p>
          </div>
          <span className="text-sm text-muted">{total} notificação(ões)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={status === filter.value ? "btn primary" : "btn ghost"}
              onClick={() => setStatus(filter.value)}
              data-active={status === filter.value || undefined}
            >
              {filter.label}
            </button>
          ))}
          <div className="flex-1" />
          <label className="neo-input-group__field w-full max-w-xs">
            <span className="neo-input-group__label">Pesquisar</span>
            <input
              type="search"
              className="neo-input"
              placeholder="Palavra-chave..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn ghost"
            disabled={!selectedIds.length}
            onClick={() => mark("mark-read", selectedIds)}
          >
            Marcar selecionadas como lidas
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={!selectedIds.length}
            onClick={() => mark("mark-unread", selectedIds)}
          >
            Marcar selecionadas como por ler
          </button>
          <button type="button" className="btn" onClick={() => mark("mark-all-read")}>Marcar todas como lidas</button>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>Selecionar</th>
                <th>Título</th>
                <th>Data</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4}>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Spinner size={16} /> A carregar notificações…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !data.length && (
                <tr>
                  <td colSpan={4}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        🔕
                      </span>
                      <p className="neo-empty__title">Sem notificações</p>
                      <p className="neo-empty__description">
                        Quando receberes novos alertas, eles aparecem aqui automaticamente.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                data.map((row) => {
                  const formattedDate = row.created_at
                    ? new Date(row.created_at).toLocaleString("pt-PT")
                    : "—";
                  return (
                    <tr
                      key={row.id}
                      className={clsx("cursor-pointer", !row.read && "font-semibold")}
                      onClick={() => openRow(row)}
                    >
                      <td onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="neo-checkbox"
                          checked={selection.has(row.id)}
                          onChange={(event) => toggleSelection(row.id, event.target.checked)}
                          aria-label="Selecionar notificação"
                        />
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span>{row.title || "(sem título)"}</span>
                          {row.body && <span className="text-xs text-muted line-clamp-2">{row.body}</span>}
                        </div>
                      </td>
                      <td className="text-sm text-muted">{formattedDate}</td>
                      <td>
                        <Badge variant={row.read ? "neutral" : "warning"}>
                          {row.read ? "Lida" : "Por ler"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <footer className="neo-pagination" aria-label="Paginação">
          <div className="neo-pagination__summary">
            Página {page + 1} de {totalPages} · {total} registo(s)
          </div>
          <div className="neo-pagination__controls">
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage(0)}
              disabled={page === 0}
            >
              «
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Seguinte
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              »
            </button>
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Por página</span>
              <select
                className="neo-input"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </footer>
      </section>

      <Modal
        open={modalOpen && !!current}
        onClose={() => setModalOpen(false)}
        title={current?.title || "Notificação"}
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-muted">
            {current?.created_at ? new Date(current.created_at).toLocaleString("pt-PT") : "—"}
          </div>
          <div className="text-sm whitespace-pre-wrap">{current?.body || "—"}</div>
          {current?.href && (
            <Link href={current.href} className="btn primary" prefetch={false}>
              Abrir destino
            </Link>
          )}
          <div className="flex flex-wrap gap-2">
            {!current?.read ? (
              <button
                type="button"
                className="btn"
                onClick={() => current && mark("mark-read", [current.id])}
              >
                Marcar como lida
              </button>
            ) : (
              <button
                type="button"
                className="btn ghost"
                onClick={() => current && mark("mark-unread", [current.id])}
              >
                Marcar por ler
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
