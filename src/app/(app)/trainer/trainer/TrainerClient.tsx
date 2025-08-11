// src/app/(app)/trainer/trainer/TrainerClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Person = { id: string; name: string | null; email: string; role: "ADMIN" | "TRAINER" | "CLIENT" };
type SessionRow = {
  id: string;
  trainerId: string;
  clientId: string;
  scheduledAt: string; // ISO
  status?: string | null;
  notes?: string | null;
  trainer?: { id: string; name: string | null; email: string };
  client?: { id: string; name: string | null; email: string };
};

type FormState = {
  id?: string;
  trainerId?: string;
  clientId?: string;
  scheduledAt?: string; // yyyy-MM-ddTHH:mm
  status?: string;
  notes?: string;
};

export default function TrainerClient() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [clients, setClients] = useState<Person[]>([]);
  const [trainers, setTrainers] = useState<Person[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SessionRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({});

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, pRes] = await Promise.all([
        fetch("/api/trainer/sessions", { cache: "no-store" }),
        fetch("/api/trainer/people", { cache: "no-store" }),
      ]);
      const sJson = await sRes.json();
      const pJson = await pRes.json();

      if (!sRes.ok) throw new Error(sJson?.error || "Erro ao obter sessões");
      if (!pRes.ok) throw new Error(pJson?.error || "Erro ao obter utilizadores");

      setSessions(
        (sJson.sessions as SessionRow[]).map((s) => ({
          ...s,
          scheduledAt: typeof s.scheduledAt === "string" ? s.scheduledAt : new Date(s.scheduledAt).toISOString(),
        }))
      );
      setClients((pJson.clients as Person[]) ?? []);
      setTrainers((pJson.trainers as Person[]) ?? []);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const startCreate = () => {
    setForm({ scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16) });
    setCreating(true);
  };

  const startEdit = (row: SessionRow) => {
    setForm({
      id: row.id,
      trainerId: row.trainerId,
      clientId: row.clientId,
      scheduledAt: row.scheduledAt.slice(0, 16),
      status: row.status ?? "",
      notes: row.notes ?? "",
    });
    setEditing(row);
  };

  const closeModals = () => {
    setCreating(false);
    setEditing(null);
    setForm({});
    setSaving(false);
    setError(null);
  };

  const onChange = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const meIsAdminOrTrainer = useMemo(() => {
    // heuristic: se veio trainers > 1, assumimos ADMIN; se veio 1 (apenas ele), é TRAINER
    return { isAdmin: trainers.length > 1, isTrainer: trainers.length >= 1 };
  }, [trainers]);

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!form.clientId || !form.scheduledAt) {
        throw new Error("Cliente e data/hora são obrigatórios.");
      }
      const payload: any = {
        clientId: form.clientId,
        scheduledAt: form.scheduledAt,
        notes: form.notes || undefined,
        status: form.status || undefined,
      };
      // ADMIN pode escolher trainerId
      if (meIsAdminOrTrainer.isAdmin && form.trainerId) payload.trainerId = form.trainerId;

      const res = await fetch("/api/trainer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao criar sessão");

      closeModals();
      await loadAll();
    } catch (e: any) {
      setError(e.message ?? "Erro ao criar sessão");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing?.id) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        clientId: form.clientId,
        scheduledAt: form.scheduledAt,
        status: form.status,
        notes: form.notes,
      };
      // ADMIN pode alterar trainerId (PT não)
      if (meIsAdminOrTrainer.isAdmin) payload.trainerId = form.trainerId;

      const res = await fetch(`/api/trainer/sessions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao atualizar sessão");

      closeModals();
      await loadAll();
    } catch (e: any) {
      setError(e.message ?? "Erro ao atualizar sessão");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar esta sessão?")) return;
    try {
      const res = await fetch(`/api/trainer/sessions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao eliminar sessão");
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? "Erro ao eliminar sessão");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm opacity-70">
          {loading ? "A carregar…" : `${sessions.length} sessão(ões)`}
        </div>
        <button
          onClick={startCreate}
          className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-black/5"
        >
          Nova sessão
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Treinador</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Notas</th>
              <th className="px-3 py-2 w-0">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(s.scheduledAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {s.client?.name || s.client?.email || s.clientId}
                </td>
                <td className="px-3 py-2">
                  {s.trainer?.name || s.trainer?.email || s.trainerId}
                </td>
                <td className="px-3 py-2">{s.status ?? "—"}</td>
                <td className="px-3 py-2 max-w-[320px] truncate" title={s.notes || ""}>
                  {s.notes ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-black/5"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-black/5"
                    >
                      Apagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center opacity-60">
                  Sem sessões.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar */}
      {(creating || editing) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {creating ? "Nova sessão" : "Editar sessão"}
              </h2>
              <button onClick={closeModals} className="rounded-lg px-2 py-1 text-sm hover:bg-black/5">
                Fechar
              </button>
            </div>

            <div className="grid gap-3">
              {/* Trainer: apenas ADMIN pode escolher; PT fica bloqueado a si */}
              {meIsAdminOrTrainer.isAdmin && (
                <label className="grid gap-1 text-sm">
                  <span>Treinador</span>
                  <select
                    value={form.trainerId ?? ""}
                    onChange={(e) => onChange({ trainerId: e.target.value || undefined })}
                    className="rounded-lg border px-3 py-2"
                  >
                    <option value="">— Selecionar —</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.email}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="grid gap-1 text-sm">
                <span>Cliente</span>
                <select
                  value={form.clientId ?? ""}
                  onChange={(e) => onChange({ clientId: e.target.value || undefined })}
                  className="rounded-lg border px-3 py-2"
                >
                  <option value="">— Selecionar —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span>Data & hora</span>
                <input
                  type="datetime-local"
                  value={form.scheduledAt ?? ""}
                  onChange={(e) => onChange({ scheduledAt: e.target.value })}
                  className="rounded-lg border px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span>Estado (opcional)</span>
                <input
                  type="text"
                  placeholder="pendente/aceite/…"
                  value={form.status ?? ""}
                  onChange={(e) => onChange({ status: e.target.value })}
                  className="rounded-lg border px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span>Notas</span>
                <textarea
                  placeholder="Observações relevantes…"
                  value={form.notes ?? ""}
                  onChange={(e) => onChange({ notes: e.target.value })}
                  className="min-h-[80px] rounded-lg border px-3 py-2"
                />
              </label>
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeModals} className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5">
                Cancelar
              </button>
              {creating ? (
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  {saving ? "A criar…" : "Criar sessão"}
                </button>
              ) : (
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  {saving ? "A guardar…" : "Guardar alterações"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
