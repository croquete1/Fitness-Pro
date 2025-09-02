'use client';

import * as React from 'react';
import PublishToggle from '@/components/exercise/PublishToggle';

type Exercise = {
  id: string;
  title?: string | null;
  published?: boolean | null;
  muscle_group?: string | null;
};

export default function AdminExerciseCatalog() {
  const [list, setList] = React.useState<Exercise[]>([]);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Ajusta este endpoint ao que tiveres no projeto: /api/admin/exercises (GET)
      const res = await fetch(`/api/admin/exercises?search=${encodeURIComponent(q)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as Exercise[];
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Pesquisar por nome, grupo muscular…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 220 }}
          aria-label="Pesquisar exercícios"
        />
        <button className="btn chip" onClick={load} aria-label="Recarregar">Recarregar</button>
      </div>

      {loading ? (
        <div className="text-muted">A carregar…</div>
      ) : list.length === 0 ? (
        <div className="text-muted">Sem resultados.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {list.map((ex) => (
            <li key={ex.id} className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ex.title ?? `Exercício ${ex.id.slice(0,6)}`}
                  </div>
                  <div style={{ fontSize: 12, opacity: .7 }}>{ex.muscle_group ?? '—'}</div>
                </div>

                {/* Badge de estado */}
                <span
                  className="chip"
                  style={{
                    background: ex.published ? 'rgba(16,185,129,.12)' : 'rgba(156,163,175,.12)',
                    color: ex.published ? '#065f46' : '#374151',
                    borderColor: ex.published ? '#10b98133' : '#9ca3af33',
                    fontWeight: 600
                  }}
                >
                  {ex.published ? 'Publicado' : 'Não publicado'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PublishToggle id={ex.id} published={!!ex.published} onChange={() => load()} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}