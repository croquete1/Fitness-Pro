"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "ADMIN" | "TRAINER" | "CLIENT";
type Status = "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED" | string;

type UserRow = {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  status?: Status | null;
  createdAt?: string | Date | null;
};

function normalizeUsers(payload: any): UserRow[] {
  // Aceita { users: [...] } | { items: [...] } | { results: [...] } | [...]
  const list =
    (payload &&
      (payload.users ?? payload.items ?? payload.results ?? payload.data)) ??
    payload;

  if (!Array.isArray(list)) return [];

  return list
    .map((u: any) => ({
      id: String(u.id ?? ""),
      name: u.name ?? null,
      email: String(u.email ?? ""),
      role: (u.role ??
        u.type ??
        "CLIENT") as Role, // fallback seguro
      status: (u.status ?? null) as Status | null,
      createdAt: u.createdAt ?? null,
    }))
    .filter((u: UserRow) => u.id && u.email);
}

function formatDate(v?: string | Date | null) {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString();
  }
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    neutral:
      "border-neutral-300 text-neutral-700 bg-white/60 dark:bg-neutral-900/50 dark:text-neutral-200 dark:border-neutral-700",
    blue: "border-blue-300 text-blue-700 bg-blue-50/80 dark:border-blue-900/40 dark:text-blue-300 dark:bg-blue-950/30",
    green:
      "border-emerald-300 text-emerald-700 bg-emerald-50/80 dark:border-emerald-900/40 dark:text-emerald-300 dark:bg-emerald-950/30",
    amber:
      "border-amber-300 text-amber-700 bg-amber-50/80 dark:border-amber-900/40 dark:text-amber-300 dark:bg-amber-950/30",
    red: "border-red-300 text-red-700 bg-red-50/80 dark:border-red-900/40 dark:text-red-300 dark:bg-red-950/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function ClientesTable() {
  const [raw, setRaw] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"" | Role>("");
  const [status, setStatus] = useState<"" | Status>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Falha a carregar utilizadores");
      const json = await res.json();
      const users = normalizeUsers(json);

      // Ordenação por data de criação (desc), se existir
      users.sort((a, b) => {
        const da = a.createdAt ? +new Date(a.createdAt) : 0;
        const db = b.createdAt ? +new Date(b.createdAt) : 0;
        return db - da;
      });

      setRaw(users);
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao obter utilizadores");
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return raw.filter((u) => {
      const matchesQ =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q);

      const matchesRole = !role || u.role === role;
      const matchesStatus = !status || (u.status ?? "").toUpperCase() === String(status).toUpperCase();

      return matchesQ && matchesRole && matchesStatus;
    });
  }, [raw, query, role, status]);

  const counts = useMemo(() => {
    const total = raw.length;
    const byRole = {
      CLIENT: raw.filter((u) => u.role === "CLIENT").length,
      TRAINER: raw.filter((u) => u.role === "TRAINER").length,
      ADMIN: raw.filter((u) => u.role === "ADMIN").length,
    };
    const pending = raw.filter((u) => (u.status ?? "").toUpperCase() === "PENDING").length;
    return { total, ...byRole, pending };
  }, [raw]);

  return (
    <section className="rounded-2xl border bg-white/60 p-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/40">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Utilizadores</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge tone="neutral">Total: {counts.total}</Badge>
            <Badge tone="blue">Clientes: {counts.CLIENT}</Badge>
            <Badge tone="green">PTs: {counts.TRAINER}</Badge>
            <Badge tone="amber">Pendentes: {counts.pending}</Badge>
            <Badge tone="neutral">Admins: {counts.ADMIN}</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar por nome ou email…"
              className="w-64 rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none transition placeholder:text-neutral-400 hover:bg-white focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900/60 dark:hover:bg-neutral-900"
            />

            <select
              value={role}
              onChange={(e) => setRole((e.target.value || "") as Role | "")}
              className="rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none transition hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/60 dark:hover:bg-neutral-900"
              aria-label="Filtrar por role"
            >
              <option value="">Todos os perfis</option>
              <option value="CLIENT">Cliente</option>
              <option value="TRAINER">PT</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus((e.target.value || "") as Status | "")}
              className="rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none transition hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/60 dark:hover:bg-neutral-900"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos os estados</option>
              <option value="PENDING">Pendente</option>
              <option value="APPROVED">Aprovado</option>
              <option value="REJECTED">Recusado</option>
              <option value="BLOCKED">Bloqueado</option>
            </select>
          </div>

          <button
            onClick={load}
            className="rounded-xl border px-3 py-2 text-sm transition hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:hover:bg-neutral-800"
            aria-label="Recarregar utilizadores"
          >
            Recarregar
          </button>
        </div>
      </header>

      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="animate-pulse rounded-xl border p-3 dark:border-neutral-800"
            >
              <div className="mb-2 h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            </li>
          ))}
        </ul>
      ) : err ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {err}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border p-6 text-sm opacity-70 dark:border-neutral-800">
          Sem resultados para os filtros aplicados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50/60 text-left text-xs uppercase tracking-wide text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
                <th className="px-3 py-2">Utilizador</th>
                <th className="px-3 py-2">Perfil</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Criado em</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const roleTone: Parameters<typeof Badge>[0]["tone"] =
                  u.role === "ADMIN"
                    ? "blue"
                    : u.role === "TRAINER"
                    ? "green"
                    : "neutral";

                const st = String(u.status ?? "").toUpperCase();
                const statusTone: Parameters<typeof Badge>[0]["tone"] =
                  st === "APPROVED"
                    ? "green"
                    : st === "PENDING"
                    ? "amber"
                    : st === "BLOCKED" || st === "REJECTED"
                    ? "red"
                    : "neutral";

                return (
                  <tr
                    key={u.id}
                    className="border-b last:border-0 dark:border-neutral-800"
                  >
                    <td className="px-3 py-3">
                      <div className="font-medium">
                        {u.name || u.email.split("@")[0]}
                      </div>
                      <div className="text-xs opacity-70">{u.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={roleTone}>
                        {u.role === "CLIENT"
                          ? "Cliente"
                          : u.role === "TRAINER"
                          ? "PT"
                          : "Admin"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone}>
                        {st === "APPROVED"
                          ? "Aprovado"
                          : st === "PENDING"
                          ? "Pendente"
                          : st === "REJECTED"
                          ? "Recusado"
                          : st === "BLOCKED"
                          ? "Bloqueado"
                          : "—"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">{formatDate(u.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                          title="Ver"
                          onClick={() => {
                            // coloca aqui a tua navegação para o perfil /admin/users/[id] ou similar
                            // e.g., router.push(`/admin/users/${u.id}`)
                            alert(`Ver utilizador ${u.email}`);
                          }}
                        >
                          Ver
                        </button>
                        <button
                          className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                          title="Editar"
                          onClick={() => {
                            alert(`Editar utilizador ${u.email}`);
                          }}
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
