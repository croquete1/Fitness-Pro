// src/components/admin/PendingApprovals.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

type Role = "ADMIN" | "TRAINER" | "CLIENT";

type PendingUser = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string; // ISO
};

function fmtWhen(d: string) {
  const date = new Date(d);
  return date.toLocaleString();
}

export default function PendingApprovals() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PendingUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/approvals", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha a carregar pendentes");
      const data = await res.json();
      setItems(
        (data.users ?? []).map((u: any) => ({
          ...u,
          createdAt: typeof u.createdAt === "string" ? u.createdAt : new Date(u.createdAt).toISOString(),
        }))
      );
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    // otimista
    const prev = items;
    setItems((s) => s.filter((x) => x.id !== id));
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Falha a atualizar estado");
    } catch (e) {
      // reverte em caso de erro
      setItems(prev);
      alert("Não foi possível concluir a ação. Tenta novamente.");
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Aprovações de conta</h2>
          <p className="text-sm text-muted-foreground">
            Gerir pedidos de registo pendentes.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Recarregar
        </button>
      </header>

      {loading && (
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border p-4 bg-muted/30 h-20"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Não há contas pendentes no momento.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="grid gap-3">
          {items.map((u) => (
            <li
              key={u.id}
              className="rounded-xl border p-4 flex items-center justify-between gap-3 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center font-medium">
                  {(u.name || u.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {u.name || u.email}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email} · {u.role} · criado {fmtWhen(u.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => act(u.id, "reject")}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => act(u.id, "approve")}
                  className="rounded-lg border px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90"
                >
                  Aprovar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
