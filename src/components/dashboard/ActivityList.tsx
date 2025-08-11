"use client";

import { useEffect, useState, useCallback } from "react";

type ActivityUser = {
  id?: string;
  name?: string | null;
  email?: string;
};

type Activity = {
  id?: string;
  type?: string;
  action?: string; // fallback para APIs antigas
  description?: string | null;
  createdAt?: string | Date;
  user?: ActivityUser | null;
};

function toArrayMaybe(data: any): Activity[] {
  // Aceita vários formatos possíveis da API:
  // { activities: [...] } | { items: [...] } | { recent: [...] } | [...]
  const candidates =
    (data && (data.activities ?? data.items ?? data.recent ?? data.records)) ??
    data;

  if (Array.isArray(candidates)) return candidates as Activity[];
  return [];
}

function formatWhen(value?: string | Date) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString();
  }
}

export default function ActivityList() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/activities", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Falha a carregar dados");

      const json = await res.json();
      const list = toArrayMaybe(json);

      // Ordena por createdAt desc se existir
      list.sort((a, b) => {
        const da = a.createdAt ? +new Date(a.createdAt) : 0;
        const db = b.createdAt ? +new Date(b.createdAt) : 0;
        return db - da;
      });

      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao obter atividades");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-2xl border bg-white/50 p-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Atividade recente</h3>
        <button
          onClick={load}
          className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:hover:bg-neutral-800"
          aria-label="Recarregar atividades"
        >
          Recarregar
        </button>
      </div>

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="animate-pulse rounded-xl border p-3 dark:border-neutral-800"
            >
              <div className="mb-2 h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm opacity-70 dark:border-neutral-800">
          Sem atividades ainda.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((a, idx) => {
            const kind = a.type ?? a.action ?? "atividade";
            const who =
              a.user?.name ||
              a.user?.email ||
              (a.user?.id ? `Utilizador ${a.user.id}` : "—");
            const when = formatWhen(a.createdAt);
            const desc = a.description ?? "";

            return (
              <li
                key={a.id ?? `${kind}-${idx}`}
                className="rounded-xl border p-3 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium capitalize">{kind}</div>
                  <div className="text-xs opacity-70">{when}</div>
                </div>
                <div className="mt-1 text-sm">
                  <span className="opacity-70">Por:</span>{" "}
                  <span className="font-medium">{who}</span>
                </div>
                {desc && (
                  <div className="mt-1 text-sm opacity-80">{desc}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
