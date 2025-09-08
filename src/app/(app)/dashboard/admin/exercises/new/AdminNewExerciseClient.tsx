'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

type FormState = {
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  videoUrl: string;
};

export default function AdminNewExerciseClient() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [f, setF] = React.useState<FormState>({
    name: '',
    muscleGroup: '',
    equipment: '',
    difficulty: '',
    instructions: '',
    videoUrl: '',
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.name.trim()) {
      setErr('O nome é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      router.push(('/dashboard/admin/exercises' as Route));
      router.refresh();
    } catch (e: any) {
      setErr(e.message || 'Falha ao criar exercício.');
    } finally {
      setSaving(false);
    }
  }

  const on = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Novo exercício</h1>
      {err && (
        <div className="badge-danger" role="alert" aria-live="polite">
          {err}
        </div>
      )}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <label className="auth-label">
          Nome *
          <input className="auth-input" value={f.name} onChange={on('name')} required />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="auth-label">
            Grupo muscular
            <input className="auth-input" value={f.muscleGroup} onChange={on('muscleGroup')} />
          </label>
          <label className="auth-label">
            Equipamento
            <input className="auth-input" value={f.equipment} onChange={on('equipment')} />
          </label>
        </div>

        <label className="auth-label">
          Dificuldade
          <input className="auth-input" value={f.difficulty} onChange={on('difficulty')} />
        </label>

        <label className="auth-label">
          Instruções
          <textarea className="auth-input" rows={5} value={f.instructions} onChange={on('instructions')} />
        </label>

        <label className="auth-label">
          Vídeo (URL)
          <input className="auth-input" value={f.videoUrl} onChange={on('videoUrl')} />
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={() => history.back()} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'A criar…' : 'Criar exercício'}
          </button>
        </div>
      </form>
    </div>
  );
}
