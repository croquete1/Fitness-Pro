'use client';

import Link from 'next/link';
import * as React from 'react';

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
  status_text?: string | null; // active | paused | ended
  notes?: string | null;
  attendance?: { done: number; total: number; spark?: number[] };
};

export default function PTWalletView({ meId, isAdmin = false }: { meId: string; isAdmin?: boolean }) {
  const [trainerId, setTrainerId] = React.useState<string>(meId);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<WalletRow[]>([]);
  const [q, setQ] = React.useState('');

  const load = React.useCallback(async () => {
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
  }, [trainerId]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.client_name ?? '').toLowerCase().includes(s) ||
      (r.package_name ?? '').toLowerCase().includes(s) ||
      (r.client_id ?? '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  // ---- ações ligadas às rotas + toasts locais --------------------------

  async function assignClient(trainerId?: string, clientId?: string) {
    if (!trainerId || !clientId) return;
    try {
      const res = await fetch('/api/admin/trainer-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId, clientId }),
      });
      if (!res.ok) throw new Error(await res.text());
      okToast('Cliente atribuído ao PT.');
      load();
    } catch (e) {
      errToast('Falhou atribuição. Verifica permissões e IDs.');
    }
  }

  async function toggleStatus(packageId: string, status?: string | null) {
    const next = status === 'active' ? 'active' : 'paused' /* default toggle to paused when not active */;
    const desired = status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/pt/packages/${encodeURIComponent(packageId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: desired }),
      });
      if (!res.ok) throw new Error(await res.text());
      okToast(desired === 'active' ? 'Pacote ativado.' : 'Pacote pausado.');
      load();
    } catch {
      errToast('Não foi possível alterar o estado.');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: 8 }}>
        <input
          className="input"
          placeholder="Procurar (cliente, pacote, id)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Pesquisar carteira"
          style={inputStyle}
        />
        {isAdmin && (
          <div style={{ display: 'grid', gap: 4 }}>
            <label style={{ fontSize: 12, opacity: .7 }}>Trainer ID</label>
            <input
              className="input"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value.trim())}
              placeholder="uuid do PT"
              aria-label="Trainer ID (Admin)"
              style={inputStyle}
            />
          </div>
        )}
        <button className="btn chip" onClick={load} aria-label="Recarregar">Recarregar</button>
        <Link href="/dashboard/pt/plans/new" className="btn primary">Novo plano</Link>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-muted">A carregar…</div>
      ) : filtered.length === 0 ? (
        <div className="text-muted">Sem pacotes/clients nesta carteira.</div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {filtered.map((r) => (
            <li
              key={r.id}
              className="card"
              style={{
                padding: 12,
                display: 'grid',
                gap: 10,
                width: '100%',
                maxWidth: 460,
                borderRadius: 12,
              }}
            >
              {/* Cabeçalho */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                  <div style={avatarStyle}>{initials(r.client_name ?? 'C')}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{r.client_name ?? `Cliente ${r.client_id?.slice(0,6)}`}</div>
                    <div style={{ fontSize: 12, opacity: .75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.package_name ?? 'Pacote'}
                    </div>
                  </div>
                </div>
                <StatusChip status={r.status_text} />
              </div>

              {/* Meta */}
              <div
                style={{
                  display: 'grid',
                  gap: 6,
                  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
                }}
              >
                <Meta label="Sessões/sem" value={num(r.sessions_per_week)} />
                <Meta label="Duração" value={r.duration_weeks ? `${r.duration_weeks} sem` : '—'} />
                <Meta label="Preço/mês" value={money(r.price_per_month_eur)} />
                <Meta label="Período" value={period(r.start_date, r.end_date)} />
              </div>

              {/* Assiduidade */}
              <Attendance row={r} />

              {/* Ações */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn chip" onClick={() => assignClient(r.trainer_id, r.client_id)}>Atribuir cliente</button>
                <button className="btn chip" onClick={() => toggleStatus(r.id, r.status_text)}>
                  {r.status_text === 'active' ? 'Pausar' : 'Ativar'}
                </button>
                <Link className="btn chip" href={`/dashboard/pt/plans?client=${r.client_id}`}>Ver planos</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 4,
        padding: 8,
        border: '1px dashed var(--border)',
        borderRadius: 10,
        background: 'var(--hover, #f9fafb)',
      }}
    >
      <div style={{ fontSize: 11, opacity: .65 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{value}</div>
    </div>
  );
}

function StatusChip({ status }: { status?: string | null }) {
  const s = (status ?? 'active').toLowerCase();
  const map: Record<string, { fg: string; bg: string; text: string }> = {
    active:  { fg: 'var(--ok, #16a34a)',     bg: 'rgba(22,163,74,.10)',  text: 'ATIVO' },
    paused:  { fg: 'var(--warn, #f59e0b)',   bg: 'rgba(245,158,11,.12)', text: 'PAUSADO' },
    ended:   { fg: 'var(--danger, #ef4444)', bg: 'rgba(239,68,68,.10)',  text: 'TERMINADO' },
  };
  const c = map[s] ?? map.active;
  return (
    <span className="chip" style={{ color: c.fg, background: c.bg, borderColor: c.fg + '33', fontWeight: 600 }}>
      {c.text}
    </span>
  );
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('');
  return p || 'C';
}
function num(n?: number | null) { return n == null ? '—' : String(n); }
function money(v?: number | null) { return v == null ? '—' : new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v); }
function period(a?: string | null, b?: string | null) {
  const A = a ? new Date(a).toLocaleDateString('pt-PT') : '—';
  const B = b ? new Date(b).toLocaleDateString('pt-PT') : '…';
  return `${A} — ${B}`;
}

/* ---------- Attendance (progress + sparkline) ---------- */

function Attendance({ row }: { row: WalletRow }) {
  const att = row.attendance;
  const done = att?.done ?? 0;
  const total = Math.max(att?.total ?? 0, done);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const spark = (att?.spark ?? []).slice(-16);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, opacity: .7 }}>Assiduidade</div>
        <div
          style={{
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--ok, #16a34a)',
            background: 'rgba(22,163,74,.10)',
            border: '1px solid #16a34a22',
          }}
        >
          {pct}%
        </div>
      </div>

      <Progress value={pct} />
      <Sparkline data={spark} />
      <div style={{ fontSize: 12, opacity: .6 }}>{done}/{total} sessões nesta janela</div>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progresso ${v}%`}
      style={{ height: 10, borderRadius: 999, background: 'var(--hover, #f1f5f9)', overflow: 'hidden' }}
    >
      <div
        style={{
          width: `${v}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #10b981, #16a34a)',
          transition: 'width .2s ease',
        }}
      />
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const width = 160, height = 40, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  const pts = data.map((y, i) => {
    const ratio = max === min ? 0.5 : (y - min) / (max - min);
    const X = pad + i * step;
    const Y = height - pad - ratio * (height - pad * 2);
    return `${X},${Y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-label="Tendência de assiduidade">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    </svg>
  );
}

/* ---------- toasts locais ---------- */

function okToast(msg: string)  { makeToast(msg, 'ok'); }
function errToast(msg: string) { makeToast(msg, 'error'); }

function makeToast(msg: string, kind: 'ok' | 'error') {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', left: '50%', transform: 'translateX(-50%)',
    bottom: '16px', padding: '10px 14px', borderRadius: '10px',
    color: kind === 'ok' ? '#065f46' : '#991b1b',
    background: kind === 'ok' ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
    border: `1px solid ${kind === 'ok' ? '#10b98122' : '#ef444422'}`,
    zIndex: 9999, fontSize: '14px', backdropFilter: 'saturate(180%) blur(6px)',
  } as React.CSSProperties);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

/* ---------- estilos inline ---------- */

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  background: 'var(--card, #fff)',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 14,
  minWidth: 220,
};

const avatarStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontWeight: 700,
  background: 'radial-gradient(100% 100% at 30% 20%, #eee, #ddd)',
  color: '#333',
  border: '1px solid #00000010',
  flex: '0 0 auto',
};