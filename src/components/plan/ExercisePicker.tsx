'use client';

import { useEffect, useState } from 'react';

type Exercise = {
  id: string;
  name: string;
  media_url?: string | null;         // foto/gif de execução
  muscle_image_url?: string | null;  // imagem músculos
};

export default function ExercisePicker({
  onSelect,
}: {
  onSelect: (exercise: Exercise) => void;
}) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      const v = q.trim();
      if (v.length < 2) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/pt/exercises/search?q=${encodeURIComponent(v)}`);
        const json = await res.json();
        if (active) setItems(json.items ?? []);
      } finally {
        if (active) setLoading(false);
      }
    }
    const t = setTimeout(run, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Procurar exercício (mín. 2 letras)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, height: 38, padding: '0 12px', borderRadius: 10, border: '1px solid var(--border)' }}
        />
        {loading ? <span className="text-muted">A procurar…</span> : null}
      </div>

      {items.length > 0 && (
        <div style={{ marginTop: 10, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {items.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="btn"
              style={{ textAlign: 'left', padding: 10 }}
              title="Adicionar ao plano"
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {ex.media_url ? (
                    <img src={ex.media_url} alt="" width={72} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    <div className="text-muted" style={{ fontSize: 12, padding: 8 }}>Sem imagem</div>
                  )}
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <strong>{ex.name}</strong>
                  {ex.muscle_image_url ? (
                    <img src={ex.muscle_image_url} alt="músculos" width={120} height={60} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  ) : (
                    <span className="text-muted" style={{ fontSize: 12 }}>Sem diagrama muscular</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
