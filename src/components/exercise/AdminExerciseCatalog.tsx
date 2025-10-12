'use client';

import * as React from 'react';
import PublishToggle from '@/components/exercise/PublishToggle';
import { getExerciseMediaInfo } from '@/lib/exercises/media';
import { parseTagList } from '@/lib/exercises/tags';

type Exercise = {
  id: string;
  name?: string | null;
  is_published?: boolean | null;
  muscle_group?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  owner?: { id: string; name: string | null; email: string | null } | null;
  video_url?: string | null;
};

export default function AdminExerciseCatalog() {
  const [list, setList] = React.useState<Exercise[]>([]);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Ajusta este endpoint ao que tiveres no projeto: /api/admin/exercises (GET)
      const res = await fetch(`/api/admin/exercises?q=${encodeURIComponent(q)}&scope=global`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const rows = Array.isArray(json?.rows) ? json.rows : Array.isArray(json) ? json : [];
      setList(
        rows.map((ex: any) => ({
          id: String(ex.id),
          name: ex.name ?? ex.title ?? '',
          muscle_group: ex.muscle_group ?? ex.muscle ?? null,
          equipment: ex.equipment ?? null,
          difficulty: ex.difficulty ?? ex.level ?? null,
          is_published: ex.is_published ?? ex.published ?? false,
          owner: ex.owner ?? null,
          video_url: ex.video_url ?? ex.gif_url ?? ex.preview_url ?? ex.media_url ?? null,
        })),
      );
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => {
    load();
  }, [load]);

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
        <button className="btn chip" onClick={load} aria-label="Recarregar">
          Recarregar
        </button>
      </div>

      {loading ? (
        <div className="text-muted">A carregar…</div>
      ) : list.length === 0 ? (
        <div className="text-muted">Sem resultados.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {list.map((ex) => {
            const media = getExerciseMediaInfo(ex.video_url);
            const muscleTags = parseTagList(ex.muscle_group);
            const equipmentTags = parseTagList(ex.equipment);
            
            return (
              <li key={ex.id} className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(59,130,246,.08), rgba(16,185,129,.12))',
                    }}
                  >
                    {media.kind !== 'none' ? (
                      media.kind === 'video' ? (
                        <video
                          src={media.src}
                          muted
                          loop
                          playsInline
                          autoPlay
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : media.kind === 'image' ? (
                        <img
                          src={media.src}
                          alt={`Pré-visualização do exercício ${ex.name ?? ''}`.trim() || 'Pré-visualização do exercício'}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <iframe
                          src={media.src}
                          title={ex.name ?? 'Pré-visualização do exercício'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ width: '100%', height: '100%', border: 0 }}
                        />
                      )
                    ) : (
                      <span role="img" aria-label="Exercício" style={{ fontSize: 32 }}>
                        💪
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {ex.name ?? `Exercício ${ex.id.slice(0, 6)}`}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {muscleTags.map((tag) => (
                          <span key={`catalog-muscle-${ex.id}-${tag}`} className="chip" style={{ fontSize: 11 }}>
                            {tag}
                          </span>
                        ))}
                        {equipmentTags.map((tag) => (
                          <span key={`catalog-equipment-${ex.id}-${tag}`} className="chip" style={{ fontSize: 11 }}>
                            {tag}
                          </span>
                        ))}
                          {ex.difficulty && (
                            <span className="chip" style={{ fontSize: 11, background: 'rgba(59,130,246,.12)', color: '#1d4ed8' }}>
                              {ex.difficulty}
                            </span>
                          )}
                        </div>
                        {ex.owner?.name && <div style={{ fontSize: 11, opacity: 0.7 }}>Autor: {ex.owner.name}</div>}
                      </div>

                      <span
                        className="chip"
                        style={{
                          background: ex.is_published ? 'rgba(16,185,129,.12)' : 'rgba(156,163,175,.12)',
                          color: ex.is_published ? '#065f46' : '#374151',
                          borderColor: ex.is_published ? '#10b98133' : '#9ca3af33',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ex.is_published ? 'Publicado' : 'Não publicado'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <PublishToggle id={ex.id} published={!!ex.is_published} onChange={() => load()} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
