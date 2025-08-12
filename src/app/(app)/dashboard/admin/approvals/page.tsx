// src/app/(app)/dashboard/admin/approvals/page.tsx
"use client";

import useSWR from "swr";
import { useState } from "react";
import { Check, X, Search } from "lucide-react";

type Item = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  role: "ADMIN" | "TRAINER" | "CLIENT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminApprovalsPage() {
  const [q, setQ] = useState("");
  const { data, mutate, isLoading } = useSWR<{ items: Item[]; total: number }>(
    `/api/admin/approvals${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    fetcher
  );

  async function act(id: string, action: "approve" | "reject") {
    await fetch("/api/admin/approvals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    mutate();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Aprovações de conta</h1>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
          <input
            className="pl-8 pr-3 py-2 rounded-lg border bg-white/70 dark:bg-neutral-900/60"
            placeholder="Procurar por nome ou email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/50">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="[&>th]:px-3 [&>th]:py-2 border-b">
              <th>Nome</th>
              <th>Email</th>
              <th>Registo</th>
              <th>Role</th>
              <th className="w-40">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={5}>
                  A carregar…
                </td>
              </tr>
            )}
            {!isLoading && data?.items?.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={5}>
                  Sem pedidos pendentes.
                </td>
              </tr>
            )}
            {data?.items?.map((u) => (
              <tr key={u.id} className="[&>td]:px-3 [&>td]:py-2 border-t">
                <td>{u.name || "—"}</td>
                <td>{u.email}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>{u.role}</td>
                <td className="flex gap-2">
                  <button
                    onClick={() => act(u.id, "approve")}
                    className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    title="Aprovar"
                  >
                    <Check className="h-4 w-4" /> Aprovar
                  </button>
                  <button
                    onClick={() => act(u.id, "reject")}
                    className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    title="Rejeitar"
                  >
                    <X className="h-4 w-4" /> Rejeitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
