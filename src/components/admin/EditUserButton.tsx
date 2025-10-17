'use client';

import { useEffect, useMemo, useState } from 'react';
import { appRoleToDbRole, toAppRole, type AppRole } from '@/lib/roles';
import type { Status } from '@/types/user';

type U = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  status: Status;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function EditUserButton({
  user,
  onSaved,
}: {
  user: U;
  onSaved?: (u: U) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name ?? '');
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<AppRole>(user.role);
  const [status, setStatus] = useState<Status>(user.status);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // sempre que abrir o modal, sincroniza com o utilizador atual
  useEffect(() => {
    if (open) {
      setName(user.name ?? '');
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
      setErr(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.id]);

  // só enviamos o que mudou (menos ruído nos logs e menos oportunidades de erro)
  const patchData = useMemo(() => {
    const out: Partial<U> = {};
    if ((user.name ?? '') !== name) out.name = name || null;
    if (user.email !== email) out.email = email;
    if (user.role !== role) out.role = role;
    if (user.status !== status) out.status = status;
    return out;
  }, [name, email, role, status, user]);

  const dirty = useMemo(() => Object.keys(patchData).length > 0, [patchData]);

  async function save() {
    if (saving) return;
    setErr(null);

    // validação básica
    if ('email' in patchData && !isEmail(email)) {
      setErr('Email inválido');
      return;
    }

    if (!dirty) {
      // nada para guardar; fecha o modal
      setOpen(false);
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = { ...patchData };
      if ('role' in payload) {
        payload.role = appRoleToDbRole(role) ?? payload.role;
      }

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j?.error || 'Erro ao guardar');
        return;
      }
      const nextRole = toAppRole(j?.role ?? payload.role ?? role) ?? role;
      const merged: U = {
        ...user,
        name: 'name' in patchData ? (j?.name ?? (name || null)) : user.name,
        email: 'email' in patchData ? (j?.email ?? email) : user.email,
        role: nextRole,
        status: (j?.status ?? status) as Status,
      };
      onSaved?.(merged);
      setOpen(false);
    } catch (e) {
      setErr('Falha de rede');
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      save();
    }
  }

  return (
    <>
      <button
        className="btn icon"
        title="Editar"
        onClick={() => setOpen(true)}
        aria-label={`Editar ${user.email}`}
      >
        ✏️
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] grid place-items-center p-4 neo-overlay"
          onClick={(e) => e.currentTarget === e.target && !saving && setOpen(false)}
          onKeyDown={onKeyDown}
        >
          <div className="card" style={{ width: 'min(680px, 92vw)', padding: 24 }}>
            <h3 className="mb-3 text-lg font-semibold text-fg">Editar utilizador</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm text-muted">Nome</span>
                <input
                  className="neo-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-muted">Email</span>
                <input
                  className="neo-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-muted">Role</span>
                <select
                  className="neo-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AppRole)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="PT">PT</option>
                  <option value="CLIENT">CLIENT</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-muted">Estado</span>
                <select
                  className="neo-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </label>
            </div>

            {err && <p className="mt-2 text-sm text-danger">{err}</p>}

            <div className="mt-4 flex items-center justify-end gap-8">
              <span className="text-sm text-muted">
                {dirty ? 'Alterações por guardar' : 'Sem alterações'}
              </span>
              <div className="flex items-center gap-8">
                <button
                  className="btn ghost"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="btn primary"
                  onClick={save}
                  disabled={saving || !dirty}
                >
                  {saving ? 'A guardar…' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
