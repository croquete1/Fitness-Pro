"use client";

import * as React from "react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export type Row = {
  id: string;
  title: string | null;
  body?: string | null;
  href?: string | null;
  read: boolean;
  created_at: string | null;
};

type Props = { rows: Row[] };

type StatusFilter = "all" | "unread" | "read";

type MarkEndpoint = "mark-read" | "mark-unread" | "mark-all-read";

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
    const controller = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const url = new URL("/api/notifications/list", window.location.origin);
        url.searchParams.set("status", status);
        url.searchParams.set("page", String(page));
        url.searchParams.set("pageSize", String(pageSize));
        if (deferredSearch) url.searchParams.set("q", deferredSearch);
        const response = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const json = await response.json();
        if (controller.signal.aborted) return;
        setData(json.items ?? []);
        setTotal(json.total ?? 0);
        setSelection(new Set());
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setData([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      controller.abort();
    };
  }, [status, page, pageSize, deferredSearch]);

  React.useEffect(() => {
    setPage(0);
  }, [status, deferredSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > nextTotalPages - 1) {
      setPage(nextTotalPages - 1);
    }
  }, [total, page, pageSize]);

  const selectedIds = React.useMemo(() => Array.from(selection), [selection]);

  const mark = React.useCallback(
    async (endpoint: MarkEndpoint, ids?: string[]) => {
      if (endpoint !== "mark-all-read" && (!ids || ids.length === 0)) {
        return;
      }
      try {
        await fetch(`/api/notifications/${endpoint}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        setData((prev) => {
          if (endpoint === "mark-all-read") {
            return prev.map((row) => ({ ...row, read: true }));
          }
          return prev.map((row) => {
            if (!ids?.includes(row.id)) return row;
            if (endpoint === "mark-read") return { ...row, read: true };
            if (endpoint === "mark-unread") return { ...row, read: false };
            return row;
          });
        });
        setSelection(new Set());
        setCurrent((prev) => {
          if (!prev) return prev;
          if (endpoint === "mark-all-read") return { ...prev, read: true };
          if (ids?.includes(prev.id)) {
            return { ...prev, read: endpoint === "mark-read" };
          }
          return prev;
        });
      } catch (error) {
        console.error(error);
      }
    },
    [],
  );

  const openRow = React.useCallback(
    (row: Row) => {
      setCurrent(row);
      setModalOpen(true);
      if (!row.read) {
        void mark("mark-read", [row.id]);
      }
    },
    [mark],
  );

  const toggleSelection = React.useCallback((id: string, checked: boolean) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const filters: Array<{ value: StatusFilter; label: string }> = React.useMemo(
    () => [
      { value: "all", label: "Todos" },
      { value: "unread", label: "Por ler" },
      { value: "read", label: "Lidas" },
    ],
    [],
  );

  return (
    <div className="notifications-center">
      <section className="neo-panel notifications-center__panel" aria-labelledby="notifications-heading">
        <header className="notifications-center__header">
          <div className="notifications-center__heading">
            <h1 id="notifications-heading" className="notifications-center__title">
              Centro de notificações
            </h1>
            <p className="notifications-center__subtitle">
              Revê alertas recentes, pesquisa e mantém o teu histórico organizado.
            </p>
          </div>
          <span className="notifications-center__summary">{total} notificação(ões)</span>
        </header>

        <div className="notifications-center__filters" role="group" aria-label="Filtrar por estado">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={status === filter.value ? "primary" : "ghost"}
              size="sm"
              onClick={() => setStatus(filter.value)}
              aria-pressed={status === filter.value}
            >
              {filter.label}
            </Button>
          ))}
          <div className="notifications-center__spacer" />
          <label className="neo-input-group__field notifications-center__search">
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

        <div className="notifications-center__actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => mark("mark-read", selectedIds)}
            disabled={!selectedIds.length}
          >
            Marcar selecionadas como lidas
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => mark("mark-unread", selectedIds)}
            disabled={!selectedIds.length}
          >
            Marcar selecionadas como por ler
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => mark("mark-all-read")}>Marcar tudo como lido</Button>
        </div>

        <div className="notifications-center__table" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th className="notifications-center__cell--select">
                  <span className="sr-only">Selecionar</span>
                </th>
                <th>Notificação</th>
                <th>Data</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4}>
                    <div className="notifications-center__loading" aria-live="assertive">
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
                      className="notifications-center__row"
                      data-read={row.read || undefined}
                      onClick={() => openRow(row)}
                    >
                      <td
                        className="notifications-center__cell--select"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="neo-checkbox"
                          checked={selection.has(row.id)}
                          onChange={(event) => toggleSelection(row.id, event.target.checked)}
                          aria-label="Selecionar notificação"
                        />
                      </td>
                      <td>
                        <div className="notifications-center__message">
                          <span className="notifications-center__messageTitle">{row.title || '(sem título)'}</span>
                          {row.body && (
                            <span className="notifications-center__messageExcerpt">{row.body}</span>
                          )}
                        </div>
                      </td>
                      <td className="notifications-center__timestamp">{formattedDate}</td>
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

        <footer className="notifications-center__footer" aria-label="Paginação">
          <div className="notifications-center__paginationSummary">
            Página {page + 1} de {totalPages} · {total} registo(s)
          </div>
          <div className="notifications-center__paginationControls">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPage(0)} disabled={page === 0}>
              «
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Seguinte
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              »
            </Button>
            <label className="neo-input-group__field notifications-center__pageSize">
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
        <div className="notifications-center__modal">
          <div className="notifications-center__modalTimestamp">
            {current?.created_at ? new Date(current.created_at).toLocaleString("pt-PT") : "—"}
          </div>
          <div className="notifications-center__modalBody">{current?.body || "—"}</div>
          {current?.href && (
            <Link href={current.href} className="btn" prefetch={false}>
              Abrir destino
            </Link>
          )}
          <div className="notifications-center__modalActions">
            {!current?.read ? (
              <Button type="button" variant="primary" size="sm" onClick={() => current && mark("mark-read", [current.id])}>
                Marcar como lida
              </button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={() => current && mark("mark-unread", [current.id])}>
                Marcar por ler
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
