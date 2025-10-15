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

const TABS = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'planos', label: 'Planos' },
  { id: 'pacotes', label: 'Pacotes' },
  { id: 'faturacao', label: 'Faturação' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function toneForStatus(value?: string | null) {
  if (!value) return 'neutral';
  const status = value.toLowerCase();
  if (['active', 'ativo', 'approved', 'confirmado', 'on'].some((token) => status.includes(token))) return 'success';
  if (['pending', 'pendente', 'draft', 'aguarda', 'pending-approval'].some((token) => status.includes(token))) return 'warning';
  if (['cancel', 'susp', 'inactive', 'terminated', 'bloqueado'].some((token) => status.includes(token))) return 'danger';
  return 'primary';
}

export default function UserProfileTabs({ user, plans, packages, isAdminOrTrainer }: Props) {
  const [tab, setTab] = useState<TabId>('resumo');
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

  const activeTab = TABS.find((entry) => entry.id === tab) ?? TABS[0];

  return (
    <div className="space-y-5">
      <div className="neo-segmented" role="tablist" aria-label="Secções do perfil">
        {TABS.map((entry) => {
          const tabId = `profile-tab-${entry.id}`;
          const panelId = `profile-panel-${entry.id}`;
          return (
            <button
              key={entry.id}
              id={tabId}
              type="button"
              className="neo-segmented__btn"
              data-active={tab === entry.id}
              role="tab"
              aria-selected={tab === entry.id}
              aria-controls={panelId}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {activeTab.id === 'resumo' && (
        <section
          id="profile-panel-resumo"
          role="tabpanel"
          aria-labelledby="profile-tab-resumo"
          className="neo-panel space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="neo-surface p-4">
              <span className="neo-surface__hint">Nome</span>
              <p className="text-sm text-fg">{user.name || '—'}</p>
            </article>
            <article className="neo-surface p-4">
              <span className="neo-surface__hint">Email</span>
              <p className="text-sm text-fg">{user.email || '—'}</p>
            </article>
            <article className="neo-surface p-4">
              <span className="neo-surface__hint">Telefone</span>
              <p className="text-sm text-fg">{user.phone || '—'}</p>
            </article>
            <article className="neo-surface p-4 space-y-2">
              <span className="neo-surface__hint">Perfil</span>
              <span className="neo-tag" data-tone="primary">{user.role ?? '—'}</span>
              <span className="neo-tag" data-tone={toneForStatus(user.status)}>Estado: {user.status ?? '—'}</span>
            </article>
            <article className="neo-surface p-4">
              <span className="neo-surface__hint">Criado</span>
              <p className="text-sm text-fg">{fmt(String(user.createdAt || ''))}</p>
            </article>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link className="btn" href={`/dashboard/search?q=${encodeURIComponent(user.name || user.email || '')}`}>
              Pesquisar este utilizador
            </Link>
            {isAdminOrTrainer && (
              <Link className="btn primary" href={`/dashboard/pt/plans/new?clientId=${user.id}`}>
                Criar plano
              </Link>
            )}
          </div>
        </section>
      )}

      {activeTab.id === 'planos' && (
        <section
          id="profile-panel-planos"
          role="tabpanel"
          aria-labelledby="profile-tab-planos"
          className="neo-panel space-y-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              className="input w-full sm:w-80"
              placeholder="Filtrar por título ou estado…"
              value={planQ}
              onChange={(event) => setPlanQ(event.target.value)}
            />
            {isAdminOrTrainer && (
              <Link className="btn" href={`/dashboard/pt/plans/new?clientId=${user.id}`}>
                Novo plano
              </Link>
            )}
          </div>

          {filteredPlans.length === 0 ? (
            <div className="neo-empty">
              <span className="neo-empty__icon" aria-hidden="true">🌌</span>
              <p className="neo-empty__title">Sem planos registados</p>
              <p className="text-sm text-muted">Assim que criares um plano, ele aparece aqui com o progresso mais recente.</p>
            </div>
          ) : (
            <ul className="grid gap-3" aria-live="polite">
              {filteredPlans.map((plan) => {
                const tone = toneForStatus(plan.status);
                return (
                  <li key={plan.id} className="neo-surface p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-fg">{plan.title || `Plano #${plan.id}`}</h3>
                        <p className="text-sm text-muted">
                          Atualizado {fmt(plan.updated_at)}
                        </p>
                        <span className="neo-tag" data-tone={tone}>
                          {plan.status || '—'}
                        </span>
                      </div>
                      <Link className="btn" href={`/dashboard/pt/plans/${plan.id}/edit`}>
                        Abrir
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {activeTab.id === 'pacotes' && (
        <section
          id="profile-panel-pacotes"
          role="tabpanel"
          aria-labelledby="profile-tab-pacotes"
          className="neo-panel space-y-5"
        >
          <input
            type="search"
            className="input w-full sm:w-80"
            placeholder="Filtrar por nome do pacote…"
            value={pkgQ}
            onChange={(event) => setPkgQ(event.target.value)}
          />
          {filteredPkgs.length === 0 ? (
            <div className="neo-empty">
              <span className="neo-empty__icon" aria-hidden="true">🛰️</span>
              <p className="neo-empty__title">Nenhum pacote ativo</p>
              <p className="text-sm text-muted">Podes adicionar pacotes de sessões ou serviços para acompanhar a utilização aqui.</p>
            </div>
          ) : (
            <ul className="grid gap-3" aria-live="polite">
              {filteredPkgs.map((pkg) => (
                <li key={pkg.id} className="neo-surface p-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold text-fg">{pkg.package_name}</h3>
                    <p className="text-xs uppercase tracking-wide text-muted">
                      {pkg.start_date || '—'} {pkg.end_date ? `→ ${pkg.end_date}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {activeTab.id === 'faturacao' && (
        <section
          id="profile-panel-faturacao"
          role="tabpanel"
          aria-labelledby="profile-tab-faturacao"
          className="neo-panel"
        >
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden="true">💳</span>
            <p className="neo-empty__title">Histórico de pagamentos a caminho</p>
            <p className="text-sm text-muted">
              Assim que integrarmos a faturação do cliente, vais conseguir consultar recibos e exportar comprovativos daqui.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
