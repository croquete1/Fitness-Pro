// src/components/admin/ApprovalsClient.tsx
"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { Check, X, Ban, Search } from "lucide-react";

type Item = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  role: "ADMIN" | "TRAINER" | "CLIENT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ApprovalsClient() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, mutate } = useSWR<{ items: Item[]; total: number }>(
    `/api/admin/approvals?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`,
    fetcher,
    { keepPreviousData: true }
  );

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1),
    [data]
  );

  async function act(id: string, action: "approve" | "reject" | "block") {
    const res = await fetch("/api/admin/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Falha na operação");
      return;
    }
    mutate(); // refresh lista
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Procurar por nome ou email…"
            className="w-full rounded-lg border bg-background px-8 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {data ? `${data.total} pendente(s)` : "—"}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Utilizador</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  A carregar…
                </td>
              </tr>
            )}
            {!isLoading && data?.items?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Sem pendentes.
                </td>
              </tr>
            )}
            {data?.items?.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">{u.name || "—"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  {new Date(u.createdAt).toLocaleString(undefined, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => act(u.id, "approve")}
                      className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-500/20"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-4 w-4" /> Aprovar
                      </span>
                    </button>
                    <button
                      onClick={() => act(u.id, "reject")}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-500/20"
                    >
                      <span className="inline-flex items-center gap-1">
                        <X className="h-4 w-4" /> Rejeitar
                      </span>
                    </button>
                    <button
                      onClick={() => act(u.id, "block")}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-500/20"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Ban className="h-4 w-4" /> Bloquear
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span>
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border px-3 py-1.5 disabled:opacity-50"
              >
                Seguinte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
