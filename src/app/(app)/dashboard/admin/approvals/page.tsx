// src/app/(app)/dashboard/admin/approvals/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, XCircle, Search } from "lucide-react";

type Item = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type Resp = {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
};

export default function ApprovalsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const paramsFor = useCallback(
    (pageArg: number) => {
      const p = new URLSearchParams();
      p.set("page", String(pageArg));
      if (q.trim()) p.set("q", q.trim());
      return p.toString();
    },
    [q]
  );

  const load = useCallback(
    async (pageArg = 1) => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(`/api/admin/approvals?${paramsFor(pageArg)}`, {
          cache: "no-store",
        });
        if (!r.ok) throw new Error("Falha a carregar aprovações");
        const json: Resp = await r.json();
        setData(json);
        setPage(pageArg);
      } catch (e: any) {
        setErr(e.message || "Erro");
      } finally {
        setLoading(false);
      }
    },
    [paramsFor]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  const act = async (id: string, action: "approve" | "reject") => {
    const r = await fetch("/api/admin/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (r.ok) load(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Aprovações de conta</h1>
          <p className="text-sm text-muted-foreground">
            Clientes à espera de aprovação para aceder à plataforma.
          </p>
        </div>

        <div className="flex items-center rounded-lg border px-3">
          <Search className="mr-2 h-4 w-4 opacity-60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1)}
            placeholder="Pesquisar por nome/email…"
            className="h-9 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Criado</th>
              <th className="px-4 py-3 text-left font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  A carregar…
                </td>
              </tr>
            ) : err ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-destructive">
                  {err}
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Sem pedidos pendentes.
                </td>
              </tr>
            ) : (
              data.items.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(u.id, "approve")}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      >
                        <BadgeCheck className="h-4 w-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => act(u.id, "reject")}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        <XCircle className="h-4 w-4" />
                        Rejeitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {data?.page ?? 1} de {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
          >
            Seguinte
          </button>
        </div>
      </div>
    </div>
  );
}
