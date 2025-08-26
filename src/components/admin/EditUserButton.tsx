'use client';

import { useState } from 'react';
import type { Role, Status } from '@prisma/client';

type U = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: Status;
};

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
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<Status>(user.status);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, status }),
    });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(j?.error || 'Erro ao guardar');
      return;
    }
    onSaved?.(j.user);
    setOpen(false);
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
          className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
          onClick={(e) => e.currentTarget === e.target && setOpen(false)}
        >
          <div className="w-full max-w-lg rounded-2xl border bg-white p-4 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold">Editar utilizador</h3>

            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Nome</span>
                <input
                  className="rounded-lg border p-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Email</span>
                <input
                  className="rounded-lg border p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Role</span>
                  <select
                    className="rounded-lg border p-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="TRAINER">TRAINER</option>
                    <option value="CLIENT">CLIENT</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Estado</span>
                  <select
                    className="rounded-lg border p-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </label>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn icon" onClick={() => setOpen(false)} disabled={saving}>
                Cancelar
              </button>
              <button
                className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'A guardar…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
