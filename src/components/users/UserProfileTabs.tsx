'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Plan = { id: string; title?: string; status?: string; updated_at?: string };
type ClientPackage = { id: string; package_name: string; start_date?: string | null; end_date?: string | null };
type UserLite = {
  id: string; name?: string | null; email?: string | null;
  role?: string | null; status?: string | null; phone?: string | null; createdAt?: string | Date;
};

type Props = {
  user: UserLite;
  plans: Plan[];
  packages: ClientPackage[];
  isAdminOrTrainer: boolean;
};

function fmt(dt?: string) {
  if (!dt) return '—';
  const d = new Date(dt);
  return isNaN(d.getTime()) ? dt : d.toLocaleString();
}

export default function UserProfileTabs({ user, plans, packages, isAdminOrTrainer }: Props) {
  const [tab, setTab] = useState<'resumo'|'planos'|'pacotes'|'faturacao'>('resumo');
  const [planQ, setPlanQ] = useState('');
  const [pkgQ, setPkgQ] = useState('');

  const filteredPlans = useMemo(() => {
    const q = planQ.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter(p => (p.title || `#${p.id}`).toLowerCase().includes(q) || (p.status || '').toLowerCase().includes(q));
  }, [plans, planQ]);

  const filteredPkgs = useMemo(() => {
    const q = pkgQ.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter(p => p.package_name.toLowerCase().includes(q));
  }, [packages, pkgQ]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          {id:'resumo', lbl:'Resumo'},
          {id:'planos', lbl:'Planos'},
          {id:'pacotes', lbl:'Pacotes'},
          {id:'faturacao', lbl:'Faturação'},
        ].map(t => (
          <button
            key={t.id}
            className={`chip ${tab===t.id ? 'chip--active' : ''}`}
            onClick={() => setTab(t.id as any)}
          >
            {t.lbl}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === 'resumo' && (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
          <div><strong>Nome:</strong> {user.name || '—'}</div>
          <div><strong>Email:</strong> {user.email || '—'}</div>
          <div><strong>Telefone:</strong> {user.phone || '—'}</div>
          <div><strong>Role:</strong> <span className="chip">{user.role}</span></div>
          <div><strong>Estado:</strong> <span className="chip">{user.status}</span></div>
          <div><strong>Criado:</strong> {fmt(String(user.createdAt || ''))}</div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Link className="btn" href={`/dashboard/search?q=${encodeURIComponent(user.name || user.email || '')}`}>
              Pesquisar este utilizador
            </Link>
            {isAdminOrTrainer && (
              <Link className="btn primary" href={`/dashboard/pt/plans/new?clientId=${user.id}`}>
                Criar plano
              </Link>
            )}
          </div>
        </div>
      )}

      {tab === 'planos' && (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="search"
              className="input"
              placeholder="Filtrar por título/estado…"
              value={planQ}
              onChange={(e) => setPlanQ(e.target.value)}
              style={{ maxWidth: 360 }}
            />
            {isAdminOrTrainer && (
              <Link className="btn" href={`/dashboard/pt/plans/new?clientId=${user.id}`}>Novo plano</Link>
            )}
          </div>

          {filteredPlans.length === 0 ? (
            <div className="muted">Sem planos.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              {filteredPlans.map((p) => (
                <li key={p.id} className="card" style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.title || `Plano #${p.id}`}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Estado: <span className="chip">{p.status || '—'}</span> · Atualizado: {fmt(p.updated_at)}
                    </div>
                  </div>
                  <Link className="btn" href={`/dashboard/pt/plans/${p.id}/edit`}>Abrir</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'pacotes' && (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <input
            type="search"
            className="input"
            placeholder="Filtrar por nome do pacote…"
            value={pkgQ}
            onChange={(e) => setPkgQ(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          {filteredPkgs.length === 0 ? (
            <div className="muted">Sem pacotes.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              {filteredPkgs.map((c) => (
                <li key={c.id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.package_name}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {c.start_date || '—'} {c.end_date ? `→ ${c.end_date}` : ''}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'faturacao' && (
        <div className="card" style={{ padding: 16 }}>
          <div className="muted">Em breve: histórico de pagamentos e recibos.</div>
        </div>
      )}
    </div>
  );
}
