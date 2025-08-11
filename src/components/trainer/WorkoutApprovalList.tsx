// src/components/trainer/WorkoutApprovalList.tsx
"use client";

import { useEffect, useState } from "react";

type WorkoutRequest = {
  id: string;
  clientName: string | null;
  createdAt: string; // ISO
  notes?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function WorkoutApprovalList() {
  const [items, setItems] = useState<WorkoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder: não chama nenhum endpoint inexistente.
  // Mantemos pronto para ligar no futuro sem quebrar o build.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Se/Quando criares o endpoint, descomenta e ajusta:
        // const res = await fetch("/api/trainer/workouts/pending", { cache: "no-store" });
        // if (!res.ok) throw new Error("Falha a carregar pedidos");
        // const data = await res.json();
        // if (active) setItems(data?.requests ?? []);

        if (active) setItems([]); // estado vazio por agora
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

  if (loading) {
    return (
      <div className="rounded-xl border p-4">
        <div className="text-sm opacity-70">A carregar pedidos…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-4">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <div className="text-base font-medium">Sem pedidos pendentes</div>
        <p className="mt-1 text-sm opacity-70">
          Quando os clientes pedirem planos de treino, aparecem aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((req) => (
        <div
          key={req.id}
          className="rounded-xl border p-4 flex items-start justify-between gap-4"
        >
          <div>
            <div className="text-sm opacity-70">Cliente</div>
            <div className="text-base font-medium">
              {req.clientName ?? "—"}
            </div>
            <div className="mt-1 text-xs opacity-60">
              Pedido em {new Date(req.createdAt).toLocaleString()}
            </div>
            {req.notes ? (
              <p className="mt-2 text-sm opacity-80">{req.notes}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
              onClick={() => alert("Aprovar: ligar API quando existir")}
            >
              Aprovar
            </button>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
              onClick={() => alert("Rejeitar: ligar API quando existir")}
            >
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
