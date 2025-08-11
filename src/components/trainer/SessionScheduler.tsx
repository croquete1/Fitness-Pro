"use client";

import * as React from "react";
import { toast } from "sonner";

type UserLite = { id: string; name: string | null; email: string };
type Meta = {
  me: { id: string; role: "ADMIN" | "TRAINER" | "CLIENT" };
  trainers: UserLite[];
  clients: UserLite[];
};

export default function SessionScheduler({ mode = "full" }: { mode?: "full" | "compact" }) {
  const [meta, setMeta] = React.useState<Meta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [trainerId, setTrainerId] = React.useState<string>("");
  const [clientId, setClientId] = React.useState<string>("");
  const [datetime, setDatetime] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/trainer/meta", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha a carregar dados");
        const data: Meta = await res.json();
        if (!mounted) return;
        setMeta(data);
        if (data.trainers.length > 0) setTrainerId(data.trainers[0].id);
        if (data.clients.length > 0) setClientId(data.clients[0].id);
      } catch (e: any) {
        toast.error(e?.message ?? "Erro a obter dados");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meta) return;
    if (!clientId || !datetime) {
      toast.warning("Preenche cliente e data/hora");
      return;
    }

    setSubmitting(true);
    const t = toast.loading("A criar sessão…");
    try {
      const res = await fetch("/api/trainer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: meta.me.role === "ADMIN" ? trainerId : undefined,
          clientId,
          scheduledAt: datetime,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Erro ao criar sessão");
      }

      setDatetime("");
      setNotes("");
      toast.success("Sessão criada com sucesso!", { id: t });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao criar sessão", { id: t });
    } finally {
      setSubmitting(false);
    }
  }

  const isAdmin = meta?.me.role === "ADMIN";
  const cardClass =
    "rounded-2xl border p-4 md:p-5 shadow-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800";

  if (loading) return <div className={cardClass}>A carregar…</div>;
  if (!meta || meta.me.role === "CLIENT") return null;

  return (
    <div className={cardClass}>
      <h3 className="mb-3 text-base font-semibold">Agendar sessão</h3>
      <form onSubmit={onSubmit} className={mode === "compact" ? "grid gap-3 md:grid-cols-4" : "grid gap-4 md:grid-cols-2"}>
        {isAdmin && (
          <label className="grid gap-1">
            <span className="text-xs opacity-70">Treinador</span>
            <select
              className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              required
            >
              {meta.trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.name ?? t.email}</option>
              ))}
            </select>
          </label>
        )}

        <label className="grid gap-1">
          <span className="text-xs opacity-70">Cliente</span>
          <select
            className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            {meta.clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name ?? c.email}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-xs opacity-70">Data & hora</span>
          <input
            type="datetime-local"
            className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </label>

        <label className="md:col-span-2 grid gap-1">
          <span className="text-xs opacity-70">Notas (opcional)</span>
          <input
            type="text"
            className="rounded-xl border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
            placeholder="Ex.: foco em perna, 45min"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className={mode === "compact" ? "md:col-span-4" : ""}>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? "A gravar…" : "Criar sessão"}
          </button>
        </div>
      </form>
    </div>
  );
}
