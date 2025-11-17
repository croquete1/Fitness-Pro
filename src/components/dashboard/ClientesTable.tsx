"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";

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

export default function ClientesTable() {
  const [raw, setRaw] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"" | Role>("");
  const [status, setStatus] = useState<"" | Status>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);
  const deferredRole = useDeferredValue(role);
  const deferredStatus = useDeferredValue(status);

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
    const q = deferredQuery.trim().toLowerCase();
    return raw.filter((u) => {
      const matchesQ =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q);

      const matchesRole = !deferredRole || u.role === deferredRole;
      const matchesStatus =
        !deferredStatus || (u.status ?? "").toUpperCase() === String(deferredStatus).toUpperCase();

      return matchesQ && matchesRole && matchesStatus;
    });
  }, [raw, deferredQuery, deferredRole, deferredStatus]);

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
    <section className="neo-panel space-y-5" aria-label="Utilizadores">
      <header className="neo-panel__header">
        <div className="neo-panel__meta">
          <h2 className="neo-panel__title">Utilizadores</h2>
          <p className="neo-panel__subtitle">Panorama rápido dos perfis registados.</p>
        </div>

        <div className="neo-panel__actions">
          <div className="neo-input-group">
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Pesquisar</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Procurar por nome ou email…"
                className="neo-input"
                type="search"
                aria-label="Procurar utilizador"
              />
            </label>
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Perfil</span>
              <select
                value={role}
                onChange={(e) => setRole((e.target.value || "") as Role | "")}
                className="neo-input"
                aria-label="Filtrar por perfil"
              >
                <option value="">Todos os perfis</option>
                <option value="CLIENT">Cliente</option>
                <option value="TRAINER">PT</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Estado</span>
              <select
                value={status}
                onChange={(e) => setStatus((e.target.value || "") as Status | "")}
                className="neo-input"
                aria-label="Filtrar por estado"
              >
                <option value="">Todos os estados</option>
                <option value="PENDING">Pendente</option>
                <option value="APPROVED">Aprovado</option>
                <option value="REJECTED">Recusado</option>
                <option value="BLOCKED">Bloqueado</option>
              </select>
            </label>
          </div>

          <Button
            variant="secondary"
            onClick={load}
            aria-label="Recarregar utilizadores"
          >
            Recarregar
          </Button>
        </div>
      </header>

      <div className="neo-panel__stats" role="status" aria-live="polite">
        <span className="neo-tag" data-tone="neutral">
          Total: {counts.total}
        </span>
        <span className="neo-tag" data-tone="primary">
          Clientes: {counts.CLIENT}
        </span>
        <span className="neo-tag" data-tone="success">
          PTs: {counts.TRAINER}
        </span>
        <span className="neo-tag" data-tone="warning">
          Pendentes: {counts.pending}
        </span>
        <span className="neo-tag" data-tone="neutral">
          Admins: {counts.ADMIN}
        </span>
      </div>

      {loading ? (
        <ul className="neo-panel__list" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="neo-surface neo-skeleton p-4" aria-hidden="true">
              <span className="neo-skeleton__line" style={{ width: '38%' }} />
              <span className="neo-skeleton__line neo-skeleton__line--muted" style={{ width: '62%' }} />
            </li>
          ))}
        </ul>
      ) : err ? (
        <div className="neo-alert" data-tone="danger" role="alert">
          <div className="neo-alert__content">
            <p className="neo-alert__message">{err}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="neo-empty">
          <span className="neo-empty__icon" aria-hidden="true">
            🔍
          </span>
          <p className="neo-empty__title">Sem resultados</p>
          <p className="neo-empty__description">
            Ajusta os filtros para veres novamente a lista de utilizadores.
          </p>
        </div>
      ) : (
        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th>Criado em</th>
                <th className="neo-table__cell--right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const st = String(u.status ?? "").toUpperCase();
                const statusTone = st === "APPROVED"
                  ? "success"
                  : st === "PENDING"
                  ? "warning"
                  : st === "BLOCKED" || st === "REJECTED"
                  ? "danger"
                  : "neutral";

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="neo-text-strong">
                        <Link href={`/dashboard/users/${u.id}`} className="clientes-table__nameLink">
                          {u.name || u.email.split("@")[0]}
                        </Link>
                      </div>
                      <div className="neo-surface__hint">{u.email}</div>
                    </td>
                    <td>
                      <span
                        className="neo-tag"
                        data-tone={u.role === "TRAINER" ? "success" : u.role === "ADMIN" ? "primary" : "neutral"}
                      >
                        {u.role === "CLIENT"
                          ? "Cliente"
                          : u.role === "TRAINER"
                          ? "PT"
                          : "Admin"}
                      </span>
                    </td>
                    <td>
                      <span className="neo-tag" data-tone={statusTone}>
                        {st === "APPROVED"
                          ? "Aprovado"
                          : st === "PENDING"
                          ? "Pendente"
                          : st === "REJECTED"
                          ? "Recusado"
                          : st === "BLOCKED"
                          ? "Bloqueado"
                          : "—"}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="neo-table__cell--right">
                      <div className="neo-table__actions">
                        <Link href={`/dashboard/users/${u.id}`} className="btn" data-variant="ghost" data-size="sm">
                          <span className="btn__label">Ver perfil</span>
                        </Link>
                        <Link
                          href={`/dashboard/admin/users/${u.id}`}
                          className="btn"
                          data-variant="ghost"
                          data-size="sm"
                        >
                          <span className="btn__label">Editar</span>
                        </Link>
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
