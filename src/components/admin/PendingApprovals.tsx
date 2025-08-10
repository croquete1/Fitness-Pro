"use client";

import { useEffect, useState } from "react";

type PendingUser = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TRAINER" | "CLIENT";
  createdAt: string;
};

export default function PendingApprovals() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PendingUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/approvals", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao carregar");
      setItems(data.users as PendingUser[]);
    } catch (e: any) {
      setError(e.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: "approve" | "suspend") {
    try {
      setBusyId(id);
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao atualizar");
      // Optimistic remove
      setItems((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      alert(e.message ?? "Erro ao atualizar");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-4">
        <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-4">
        <h3 className="text-lg font-semibold mb-2">Aprovações pendentes</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Aprovações pendentes</h3>
        <button
          onClick={load}
          className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
        >
          Atualizar
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm opacity-70">Sem pedidos pendentes. 🎉</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b">
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Criado</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{u.name ?? "-"}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => act(u.id, "approve")}
                        disabled={busyId === u.id}
                        className="px-3 py-1 rounded bg-green-600 text-white hover:opacity-90 disabled:opacity-60"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => act(u.id, "suspend")}
                        disabled={busyId === u.id}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:opacity-90 disabled:opacity-60"
                      >
                        Suspender
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
