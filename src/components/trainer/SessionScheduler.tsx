// src/components/trainer/SessionScheduler.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type MetaResp = {
  role: "ADMIN" | "TRAINER" | "CLIENT";
  me: { id: string; name: string | null; email: string };
  trainers: Array<{ id: string; name: string | null; email: string }>;
  clients: Array<{ id: string; name: string | null; email: string }>;
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error("Falha a carregar metadata");
    return r.json();
  });

export default function SessionScheduler({
  variant = "full",
}: {
  variant?: "compact" | "full";
}) {
  const { data, error, isLoading, mutate } = useSWR<MetaResp>(
    "/api/trainer/meta",
    fetcher
  );

  const [trainerId, setTrainerId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [when, setWhen] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const isAdmin = data?.role === "ADMIN";

  // Pré-selecionar trainer quando não for admin
  useEffect(() => {
    if (data && !isAdmin) setTrainerId(data.me.id);
  }, [data, isAdmin]);

  const canSubmit = useMemo(
    () => !!clientId && !!when && (!!trainerId || !isAdmin),
    [clientId, when, trainerId, isAdmin]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const body: any = {
      clientId,
      scheduledAt: new Date(when).toISOString(),
      notes: notes || null,
    };
    if (isAdmin) body.trainerId = trainerId;

    const res = await fetch("/api/trainer/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      alert(msg?.error ?? "Falha ao criar sessão");
      return;
    }

    setNotes("");
    setWhen("");
    if (isAdmin) setTrainerId("");
    setClientId("");
    // se houver SWR em outras listas, poderíamos revalidar aqui
    mutate();
    alert("Sessão criada com sucesso ✅");
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">A carregar…</div>;
  }
  if (error || !data) {
    return (
      <div className="text-sm text-red-600">
        Falha a carregar dados. Tente recarregar a página.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={variant === "compact" ? "space-y-3" : "space-y-4"}>
      <div className="grid gap-3 sm:grid-cols-2">
        {isAdmin && (
          <div className="flex flex-col gap-1">
            <label className="text-xs opacity-70">Treinador</label>
            <select
              className="rounded-md border px-3 py-2 bg-background"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              required
            >
              <option value="">— Selecionar —</option>
              {data.trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? t.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70">Cliente</label>
          <select
            className="rounded-md border px-3 py-2 bg-background"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            <option value="">— Selecionar —</option>
            {data.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ?? c.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70">Data & hora</label>
          <input
            type="datetime-local"
            className="rounded-md border px-3 py-2 bg-background"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs opacity-70">Notas (opcional)</label>
          <textarea
            className="rounded-md border px-3 py-2 bg-background min-h-20"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: foco em hipertrofia / avaliação inicial"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center rounded-lg border px-4 py-2 font-medium shadow-sm hover:shadow transition disabled:opacity-50"
        >
          Agendar sessão
        </button>
        <span className="text-xs text-muted-foreground">
          As sessões aparecem automaticamente na aba PT.
        </span>
      </div>
    </form>
  );
}
