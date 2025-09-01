// src/components/plans/AdminPlanForm.tsx
'use client';

import * as React from 'react';

export default function AdminPlanForm() {
  const [title, setTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!title.trim()) {
      setMsg('Indica um título.');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/admin/training-plans', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTitle('');
      setMsg('Template criado com sucesso ✅');
    } catch (err: any) {
      setMsg(err?.message || 'Falha ao criar o template.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Título</span>
        <input
          type="text"
          placeholder="ex.: HIIT 30’ Iniciantes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            width: '100%',
          }}
        />
      </label>

      <button
        className="btn primary"
        disabled={saving}
        style={{ width: '100%', padding: '10px 12px' }}
      >
        {saving ? 'A criar…' : 'Criar template'}
      </button>

      {msg && (
        <div
          role="status"
          style={{
            marginTop: 4,
            fontSize: 13,
            color: msg.includes('✅') ? 'var(--fg)' : 'var(--danger, #c00)',
          }}
        >
          {msg}
        </div>
      )}
    </form>
  );
}