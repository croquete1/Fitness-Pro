'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import UIButton from '@/components/ui/UIButton';
import { toast } from '@/components/ui/Toaster';
import type { UiUser } from '@/types/user';

export default function UsersClientView({ users }: { users: UiUser[] }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState<'approve'|'suspend'|'export'|null>(null);

  const toggle = (id: string) =>
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const allIds = users.map(u => u.id);
  const allSelected = selected.size > 0 && selected.size === users.length;

  const toggleAll = () => {
    setSelected(prev => (prev.size === users.length ? new Set() : new Set(allIds)));
  };

  async function patchStatus(status: 'ACTIVE'|'SUSPENDED') {
    if (selected.size === 0) return;
    setBusy(status === 'ACTIVE' ? 'approve' : 'suspend');
    try {
      const res = await fetch('/api/admin/users/bulk-status', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], status }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Estados actualizados ✅', 2000, 'success');
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast('Falha ao actualizar utilizadores', 3000, 'error');
    } finally {
      setBusy(null);
    }
  }

  async function exportSelected() {
    setBusy('export');
    try {
      const res = await fetch('/api/admin/users.csv', {
        method: selected.size ? 'POST' : 'GET',
        headers: selected.size ? { 'content-type': 'application/json' } : undefined,
        body: selected.size ? JSON.stringify({ ids: [...selected] }) : undefined,
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selected.size ? 'users_selected.csv' : 'users.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast('Exportação pronta 📄', 2000, 'success');
    } catch (e) {
      console.error(e);
      toast('Falha ao exportar CSV', 3000, 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <UIButton variant="primary" onClick={() => patchStatus('ACTIVE')} disabled={busy !== null || selected.size === 0}>
          {busy === 'approve' ? 'A aprovar…' : 'Aprovar selecionados'}
        </UIButton>
        <UIButton variant="danger" onClick={() => patchStatus('SUSPENDED')} disabled={busy !== null || selected.size === 0}>
          {busy === 'suspend' ? 'A suspender…' : 'Suspender selecionados'}
        </UIButton>
        <div style={{ flex: 1 }} />
        <UIButton variant="outline" onClick={exportSelected} disabled={busy !== null}>
          {busy === 'export' ? 'A exportar…' : 'Exportar CSV'}
        </UIButton>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ textAlign: 'left' }}>
            <tr>
              <th style={{ padding: 8 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th style={{ padding: 8 }}>Nome</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8 }}>Estado</th>
              <th style={{ padding: 8 }}>Criado</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 8 }}>
                  <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} />
                </td>
                <td style={{ padding: 8, fontWeight: 600 }}>{u.name ?? '—'}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>
                  <Badge variant={u.role === 'ADMIN' ? 'info' : u.role === 'PT' ? 'primary' : 'neutral'}>
                    {u.role}
                  </Badge>
                </td>
                <td style={{ padding: 8 }}>
                  <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'neutral'}>
                    {u.status}
                  </Badge>
                </td>
                <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
