'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ExercisePicker from './ExercisePicker';
import { toast } from '@/components/ui/toast';
import Spinner from '@/components/ui/Spinner';

type Exercise = { id: string; name: string; media_url?: string | null; muscle_image_url?: string | null };

type Initial = {
  id?: string;
  trainerId: string;
  clientId: string;
  title: string;
  notes: string;
  status: string;
  exercises: Exercise[];
};

export default function PlanEditor({
  mode,
  initial,
  admin = false,           // <— NOVO: ADMIN pode trocar trainerId
}: {
  mode: 'create' | 'edit';
  initial: Initial;
  admin?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit';

  function addExercise(ex: Exercise) {
    setForm((f) => ({ ...f, exercises: [...f.exercises, ex] }));
    toast('Exercício adicionado');
  }
  function removeExercise(index: number) {
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== index) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        trainerId: form.trainerId,
        clientId: form.clientId || null,
        title: form.title,
        notes: form.notes || null,
        status: form.status || 'draft',
        exercises: form.exercises,
      };

      const res = await fetch(isEdit ? `/api/pt/plans/${form.id}` : '/api/pt/plans', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast(j?.error || 'Erro ao guardar', 'err');
        return;
      }

      toast(isEdit ? 'Plano atualizado' : 'Plano criado');
      router.push('/dashboard/pt/plans');
      router.refresh();
    } catch {
      toast('Erro ao guardar', 'err');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
      <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
        {admin && (
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Treinador (ID)</label>
            <input
              value={form.trainerId}
              onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
              placeholder="ID do treinador responsável"
              className="input"
              style={{ height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)' }}
              required
            />
            <small className="text-muted">No próximo passo podemos trocar por um selector por nome.</small>
          </div>
        )}

        <div style={{ display: 'grid', gap: 8 }}>
          <label>Título</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex.: Plano Hipertrofia — 4 dias"
            className="input"
            style={{ height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)' }}
            required
          />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label>Cliente (opcional)</label>
          <input
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            placeholder="ID do cliente (podes deixar vazio)"
            className="input"
            style={{ height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label>Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            className="input"
            style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--btn-bg)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label>Estado</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input"
            style={{ height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)' }}
          >
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      {/* Picker de exercícios */}
      <ExercisePicker onSelect={addExercise} />

      {/* Lista do plano */}
      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Exercícios do plano</h3>
        {form.exercises.length === 0 ? (
          <div className="text-muted">Ainda não adicionaste exercícios.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {form.exercises.map((ex, i) => (
              <div key={`${ex.id}-${i}`} className="card" style={{ padding: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {ex.media_url ? (
                      <img src={ex.media_url} alt="" width={72} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    ) : (
                      <div className="text-muted" style={{ fontSize: 12, padding: 8 }}>Sem imagem</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>{ex.name}</strong>
                    <div>
                      {ex.muscle_image_url ? (
                        <img src={ex.muscle_image_url} alt="músculos" width={160} height={80} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12 }}>Sem diagrama muscular</span>
                      )}
                    </div>
                  </div>
                  <button type="button" className="btn chip" onClick={() => removeExercise(i)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
        <button type="submit" className="btn primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {saving ? <Spinner /> : null}
          {saving ? 'A guardar…' : isEdit ? 'Guardar alterações' : 'Criar plano'}
        </button>
      </div>
    </form>
  );
}
