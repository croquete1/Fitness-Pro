'use client';

import * as React from 'react';
import type { Route } from 'next';
import Link from 'next/link';

type Folga = { id: string; title?: string | null; start: string; end: string };
type Location = { id: string; name: string; travel_min?: number | null };

export default function PTLiveOverviewCards() {
  const [folgas, setFolgas] = React.useState<Folga[]>([]);
  const [locs, setLocs] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/pt/scheduler/meta', { cache: 'no-store' });
    const json = await res.json().catch(() => ({}));
    setFolgas(json.folgas ?? []);
    setLocs(json.locations ?? []);
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const cancelFolga = async (id: string) => {
    if (!confirm('Anular esta folga?')) return;
    const res = await fetch(`/api/pt/folgas/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert(await res.text()); return; }
    setFolgas(f => f.filter(x => x.id !== id));
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Folgas futuras */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0 }}>🛌 Folgas futuras</h3>
          <Link className="btn chip" href={'/dashboard/pt/settings/folgas' as Route}>Gerir folgas</Link>
        </div>
        {loading ? (
          <div className="text-muted small" style={{ padding: 8 }}>A carregar…</div>
        ) : folgas.length === 0 ? (
          <div className="text-muted small" style={{ padding: 8 }}>Sem folgas futuras.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {folgas.map(f => (
              <li key={f.id} className="card" style={{ padding: 10, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{f.title ?? 'Folga'}</div>
                  <div className="small text-muted">
                    {new Date(f.start).toLocaleString('pt-PT')} → {new Date(f.end).toLocaleString('pt-PT')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link className="btn chip" href={'/dashboard/pt/settings/folgas' as Route}>Editar</Link>
                  <button className="btn chip" onClick={() => cancelFolga(f.id)}>Anular</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Locais */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0 }}>📍 Locais</h3>
          <Link className="btn chip" href={'/dashboard/pt/settings/locations' as Route}>Novo local</Link>
        </div>
        {loading ? (
          <div className="text-muted small" style={{ padding: 8 }}>A carregar…</div>
        ) : locs.length === 0 ? (
          <div className="text-muted small" style={{ padding: 8 }}>Ainda sem locais.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {locs.map(l => (
              <div key={l.id} className="card" style={{ padding: 10, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.name}</div>
                  <div className="small text-muted">Buffer de deslocação: {Math.max(0, Number(l.travel_min ?? 0))} min</div>
                </div>
                <Link className="btn chip" href={'/dashboard/pt/settings/locations' as Route}>Editar</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
