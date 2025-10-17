// src/components/trainer/ClientListTable.tsx
"use client";

import { useEffect, useState } from "react";

type Client = {
  id: string;
  name: string | null;
  email: string;
};

export default function ClientListTable({
  onSelect,
}: {
  onSelect?: (id: string) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/trainer/meta", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha a carregar clientes");
        const data = await res.json();
        const list: Client[] = data?.clients ?? [];
        if (active) setClients(list);
      } catch (e: any) {
        if (active) setError(e?.message ?? "Erro");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="text-sm opacity-70">A carregar clientes…</div>;
  if (error) return <div className="text-sm text-danger">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4" />
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="py-2 pr-4">{c.name ?? "—"}</td>
              <td className="py-2 pr-4">{c.email}</td>
              <td className="py-2">
                {onSelect && (
                  <button
                    onClick={() => onSelect(c.id)}
                    className="btn ghost"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                  >
                    Selecionar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
