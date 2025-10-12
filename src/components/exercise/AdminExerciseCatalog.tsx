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
  creator?: { id: string; name: string | null; email: string | null } | null;
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
          creator: ex.creator ?? null,
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
    <div className="card catalog-root">
      <div className="catalog-controls">
        <input
          className="input"
          placeholder="Pesquisar por nome, grupo muscular…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Pesquisar exercícios"
        />
        <button className="btn chip catalog-refresh" onClick={load} aria-label="Recarregar">
          Recarregar
        </button>
      </div>

      {loading ? (
        <div className="text-muted">A carregar…</div>
      ) : list.length === 0 ? (
        <div className="text-muted">Sem resultados.</div>
      ) : (
        <ul className="catalog-list">
          {list.map((ex) => {
            const media = getExerciseMediaInfo(ex.video_url);
            const muscleTags = parseTagList(ex.muscle_group);
            const equipmentTags = parseTagList(ex.equipment);
            const creatorName =
              ex.creator?.name ??
              ex.creator?.email ??
              ex.owner?.name ??
              ex.owner?.email ??
              null;

            return (
              <li key={ex.id} className="card catalog-item">
                <div className="catalog-media">
                  {media.kind !== 'none' ? (
                    media.kind === 'video' ? (
                      <video src={media.src} muted loop playsInline autoPlay />
                    ) : media.kind === 'image' ? (
                      <img
                        src={media.src}
                        alt={`Pré-visualização do exercício ${ex.name ?? ''}`.trim() || 'Pré-visualização do exercício'}
                        loading="lazy"
                      />
                    ) : (
                      <iframe
                        src={media.src}
                        title={ex.name ?? 'Pré-visualização do exercício'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  ) : (
                    <span role="img" aria-label="Exercício">
                      💪
                    </span>
                  )}
                </div>

                <div className="catalog-body">
                  <div className="catalog-header">
                    <div className="catalog-title">
                      <div className="catalog-name">{ex.name ?? `Exercício ${ex.id.slice(0, 6)}`}</div>
                      <div className="catalog-tags">
                        {muscleTags.map((tag) => (
                          <span key={`catalog-muscle-${ex.id}-${tag}`} className="chip">
                            {tag}
                          </span>
                        ))}
                        {equipmentTags.map((tag) => (
                          <span key={`catalog-equipment-${ex.id}-${tag}`} className="chip">
                            {tag}
                          </span>
                        ))}
                        {ex.difficulty && (
                          <span className="chip difficulty-chip">{ex.difficulty}</span>
                        )}
                      </div>
                      {creatorName && <div className="catalog-creator">Criado por: {creatorName}</div>}
                    </div>

                    <span className={`chip status ${ex.is_published ? 'status-published' : 'status-draft'}`}>
                      {ex.is_published ? 'Publicado' : 'Não publicado'}
                    </span>
                  </div>

                  <div className="catalog-actions">
                    <PublishToggle id={ex.id} published={!!ex.is_published} onChange={() => load()} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <style jsx>{`
        .catalog-root {
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .catalog-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .catalog-controls :global(input.input) {
          flex: 1;
          min-width: 220px;
        }

        .catalog-refresh {
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .catalog-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 10px;
        }

        .catalog-item {
          padding: 12px;
          display: flex;
          gap: 12px;
          align-items: stretch;
        }

        .catalog-media {
          width: 90px;
          height: 90px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.12));
        }

        .catalog-media > :global(video),
        .catalog-media > :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .catalog-media > :global(iframe) {
          width: 100%;
          height: 100%;
          border: 0;
        }

        .catalog-media span {
          font-size: 32px;
        }

        .catalog-body {
          flex: 1;
          display: grid;
          gap: 12px;
          min-width: 0;
        }

        .catalog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .catalog-title {
          min-width: 0;
          display: grid;
          gap: 6px;
        }

        .catalog-name {
          font-weight: 600;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .catalog-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .catalog-tags :global(.chip) {
          font-size: 11px;
        }

        .difficulty-chip {
          background: rgba(59, 130, 246, 0.12);
          color: #1d4ed8;
        }

        .catalog-creator {
          font-size: 11px;
          opacity: 0.7;
        }

        .status {
          font-weight: 600;
          white-space: nowrap;
        }

        .status-published {
          background: rgba(16, 185, 129, 0.12);
          color: #065f46;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .status-draft {
          background: rgba(156, 163, 175, 0.12);
          color: #374151;
          border-color: rgba(156, 163, 175, 0.2);
        }

        .catalog-actions {
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .catalog-root {
            gap: 16px;
          }

          .catalog-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .catalog-controls :global(input.input) {
            min-width: 0;
            width: 100%;
          }

          .catalog-refresh {
            width: 100%;
            justify-content: center;
          }

          .catalog-item {
            flex-direction: column;
          }

          .catalog-media {
            width: 100%;
            height: 180px;
            border-radius: 16px;
          }

          .catalog-body {
            gap: 16px;
          }

          .catalog-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .catalog-actions {
            justify-content: flex-start;
          }

          .status {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
