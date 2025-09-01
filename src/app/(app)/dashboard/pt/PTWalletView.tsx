'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type WalletRow = {
  id: string;
  trainer_id: string;
  client_id: string;
  client_name?: string | null;
  package_name?: string | null;
  sessions_per_week?: number | null;
  duration_weeks?: number | null;
  price_per_month_eur?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status_text?: string | null; // ex.: active, paused, ended
  notes?: string | null;

  // dados de assiduidade (se já tiveres numa view/endpoint)
  attendance?: {
    done: number;   // sessões realizadas na janela
    total: number;  // sessões previstas na janela
    spark?: number[]; // série curta para sparkline (últimas n semanas)
  };
};

export default function PTWalletView({
  meId,
  isAdmin = false,
}: {
  meId: string;
  isAdmin?: boolean;
}) {
  const [trainerId, setTrainerId] = useState<string>(meId);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<WalletRow[]>([]);
  const [q, setQ] = useState('');

  // fetch carteira (ajusta o endpoint para o teu real)
  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pt/wallet?trainer=${encodeURIComponent(trainerId)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as WalletRow[];
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.client_name ?? '').toLowerCase().includes(s) ||
      (r.package_name ?? '').toLowerCase().includes(s) ||
      r.client_id?.toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <div className="wallet">
      {/* Filtros / Admin target */}
      <div className="toolbar">
        <input
          className="input"
          placeholder="Procurar (cliente, pacote, id)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Pesquisar carteira"
        />
        {isAdmin && (
          <div className="admin-pt">
            <label className="label">Trainer ID</label>
            <input
              className="input"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value.trim())}
              placeholder="uuid do PT"
              aria-label="Trainer ID (Admin)"
            />
          </div>
        )}
        <button className="btn chip" onClick={load} aria-label="Recarregar">Recarregar</button>
        <Link href="/dashboard/pt/plans/new" className="btn primary">Novo plano</Link>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="muted">A carregar…</div>
      ) : filtered.length === 0 ? (
        <div className="muted">Sem pacotes/clients nesta carteira.</div>
      ) : (
        <ul className="grid">
          {filtered.map((r) => (
            <li key={r.id} className="card item">
              <header className="item-head">
                <div className="who">
                  <div className="avatar">{initials(r.client_name ?? 'C')}</div>
                  <div className="who-names">
                    <div className="client">{r.client_name ?? `Cliente ${r.client_id?.slice(0,6)}`}</div>
                    <div className="pkg">{r.package_name ?? 'Pacote'}</div>
                  </div>
                </div>
                <StatusChip status={r.status_text} />
              </header>

              <div className="meta">
                <Meta label="Sessões/sem" value={num(r.sessions_per_week)} />
                <Meta label="Duração" value={r.duration_weeks ? `${r.duration_weeks} sem` : '—'} />
                <Meta label="Preço/mês" value={money(r.price_per_month_eur)} />
                <Meta label="Período" value={period(r.start_date, r.end_date)} grow />
              </div>

              <Attendance row={r} />

              <footer className="actions">
                <button className="btn chip" onClick={() => assignClient(r.trainer_id, r.client_id)}>Atribuir cliente</button>
                <button className="btn chip" onClick={() => toggleStatus(r.id, r.status_text)}>
                  {r.status_text === 'active' ? 'Pausar' : 'Ativar'}
                </button>
                <Link className="btn chip" href={`/dashboard/pt/plans?client=${r.client_id}`}>Ver planos</Link>
              </footer>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .wallet { display: grid; gap: 12px; }
        .toolbar {
          display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
          padding: 8px;
        }
        .input {
          border: 1px solid var(--border);
          background: var(--card, #fff);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 14px;
          min-width: 220px;
        }
        .label { font-size: 12px; opacity: .7; }
        .admin-pt { display: grid; gap: 4px; }
        .grid {
          list-style: none; padding: 0; margin: 0;
          display: grid; gap: 10px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (max-width: 1100px) {
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr; }
        }
        .item { padding: 12px; display: grid; gap: 10px; }
        .item-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .who { display: flex; gap: 10px; align-items: center; min-width: 0; }
        .avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: grid; place-items: center; font-weight: 700;
          background: radial-gradient(100% 100% at 30% 20%, #eee, #ddd);
          color: #333; border: 1px solid #00000010;
          flex: 0 0 auto;
        }
        .who-names { min-width: 0; }
        .client { font-weight: 600; }
        .pkg { font-size: 12px; opacity: .7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .meta { display: grid; gap: 6px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 768px) { .meta { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .meta-item {
          display: grid; gap: 4px; padding: 8px; border: 1px dashed var(--border);
          border-radius: 10px; background: var(--hover, #f9fafb);
        }
        .meta-label { font-size