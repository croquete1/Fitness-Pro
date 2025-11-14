'use client';

import * as React from 'react';
import Link from 'next/link';

import ProfileHeroTabs, { type ProfileHeroTab } from '@/app/(app)/dashboard/profile/ProfileHeroTabs';
import ProfileForm from './ProfileForm.client';

type AdminProfileClientProps = {
  userId: string;
  email: string;
  displayName: string;
  roleLabel: string;
  aboutText: string;
  heroMeta: string[];
  metrics: Array<{ label: string; value: string; helper: string; tone: string }>;
  highlight?: { tone: string; title: string; description: string } | null;
  initialForm: {
    name?: string | null;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    phone?: string | null;
  };
  team: {
    totals: { admin: number; trainer: number; client: number; pending: number; total: number };
    recent: Array<{ id: string; name: string; email: string | null; role: string; status: string; joined: string }>;
  };
  plans: {
    statuses: { active: number; draft: number; archived: number; deleted: number };
    recent: Array<{
      id: string;
      title: string;
      statusLabel: string;
      statusTone: string;
      trainer: string;
      client: string;
      updated: string;
    }>;
  };
};

const EMPTY_HIGHLIGHT = {
  tone: 'warning' as const,
  title: 'Completa a tua biografia',
  description: 'Partilha especializações, certificações e objectivos para melhorar a comunicação com a equipa.',
};

export default function AdminProfileClient({
  userId,
  email,
  displayName,
  roleLabel,
  aboutText,
  heroMeta,
  metrics,
  highlight,
  initialForm,
  team,
  plans,
}: AdminProfileClientProps) {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'team' | 'plans' | 'settings'>('profile');
  const avatarUrl = initialForm.avatar_url ?? null;
  const resolvedHighlight = highlight ?? EMPTY_HIGHLIGHT;

  const tabs = React.useMemo<ProfileHeroTab<'profile' | 'team' | 'plans' | 'settings'>[]>(
    () => [
      { label: 'Perfil', value: 'profile', kind: 'local' },
      { label: 'Equipa', value: 'team', kind: 'local' },
      { label: 'Planos', value: 'plans', kind: 'local' },
      { label: 'Definições', value: 'settings', kind: 'link', href: '/dashboard/settings' },
    ],
    [],
  );

  return (
    <div className="profile-dashboard profile-shell">
      <section className="profile-dashboard__hero" aria-label="Resumo do perfil">
        <div className="profile-dashboard__heroBackdrop" aria-hidden />
        <div className="profile-dashboard__heroInner">
          <div className="profile-dashboard__heroHeader">
            <div className="profile-dashboard__heroIdentity">
              <div className="profile-dashboard__avatar" aria-hidden>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={displayName} />
                ) : (
                  <span>{displayName.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <span className="profile-dashboard__heroRole">{roleLabel}</span>
                <h1>{displayName}</h1>
                <p>{aboutText}</p>
              </div>
            </div>
            <div className="profile-dashboard__heroActions">
              {email ? <span className="profile-dashboard__heroStatus">Conta · {email}</span> : null}
              <div className="profile-dashboard__heroButtons">
                <Link href="#profile-shell-form" className="btn" data-variant="secondary" data-size="sm">
                  Editar perfil
                </Link>
              </div>
            </div>
          </div>

          {heroMeta.length ? (
            <ul className="profile-dashboard__heroMeta" role="list">
              {heroMeta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          <ProfileHeroTabs<'profile' | 'team' | 'plans' | 'settings'>
            tabs={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
            ariaLabel="Navegação do perfil do administrador"
          />

          {resolvedHighlight ? (
            <div className={`profile-dashboard__highlight ${resolvedHighlight.tone}`}>
              <div className="profile-dashboard__highlightContent">
                <strong>{resolvedHighlight.title}</strong>
                <p>{resolvedHighlight.description}</p>
              </div>
            </div>
          ) : null}

          <div className="profile-dashboard__heroMetrics">
            {metrics.map((metric) => (
              <article key={metric.label} className={`profile-hero__metric ${metric.tone}`}>
                <header>
                  <span>{metric.label}</span>
                </header>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="profile-dashboard__panels">
        <div
          id="profile-panel-profile"
          role="tabpanel"
          aria-labelledby="profile-tab-profile"
          hidden={activeTab !== 'profile'}
        >
          <section className="profile-shell__details">
            <div className="profile-shell__detailsGrid">
              <article className="profile-shell__infoCard">
                <h2>Sobre</h2>
                <p>{aboutText}</p>
              </article>
              <article className="profile-shell__infoCard">
                <h2>Contactos</h2>
                <dl>
                  <div>
                    <dt>Email</dt>
                    <dd>{email || '—'}</dd>
                  </div>
                  <div>
                    <dt>Telefone</dt>
                    <dd>{initialForm.phone ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Username</dt>
                    <dd>{initialForm.username ?? '—'}</dd>
                  </div>
                </dl>
              </article>
            </div>
          </section>

          <section className="neo-panel profile-shell__form" id="profile-shell-form">
            <header className="profile-shell__formHeader">
              <div>
                <h2>Editar informação</h2>
                <p>Actualiza nome, username, biografia e contactos associados à tua conta.</p>
              </div>
            </header>
            <ProfileForm userId={userId} initial={initialForm} canEditPrivate />
          </section>
        </div>

        <div
          id="profile-panel-team"
          role="tabpanel"
          aria-labelledby="profile-tab-team"
          hidden={activeTab !== 'team'}
        >
          <section className="profile-panel" aria-label="Resumo da equipa">
            <header className="profile-panel__header">
              <div>
                <h2>Equipa & colaboradores</h2>
                <p>Distribuição por cargos e últimos membros adicionados à organização.</p>
              </div>
              <Link href="/dashboard/admin/users" className="profile-panel__link">
                Gerir equipa
              </Link>
            </header>

            <div className="profile-team__metrics">
              <article>
                <span>Administradores</span>
                <strong>{team.totals.admin}</strong>
              </article>
              <article>
                <span>Personal Trainers</span>
                <strong>{team.totals.trainer}</strong>
              </article>
              <article>
                <span>Clientes</span>
                <strong>{team.totals.client}</strong>
              </article>
              <article>
                <span>Convites pendentes</span>
                <strong>{team.totals.pending}</strong>
              </article>
            </div>

            <div className="profile-team__table">
              <header>
                <h3>Últimos membros</h3>
                <span>{team.totals.total} no total</span>
              </header>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Função</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Entrou</th>
                  </tr>
                </thead>
                <tbody>
                  {team.recent.map((member) => (
                    <tr key={member.id}>
                      <th scope="row">
                        <span>{member.name}</span>
                        <small>{member.email ?? 'Sem email'}</small>
                      </th>
                      <td>{member.role}</td>
                      <td>{member.status}</td>
                      <td>{member.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div
          id="profile-panel-plans"
          role="tabpanel"
          aria-labelledby="profile-tab-plans"
          hidden={activeTab !== 'plans'}
        >
          <section className="profile-panel" aria-label="Resumo dos planos">
            <header className="profile-panel__header">
              <div>
                <h2>Planos de treino publicados</h2>
                <p>Visão geral das entregas e do estado dos planos geridos pela equipa.</p>
              </div>
              <Link href="/dashboard/admin/plans" className="profile-panel__link">
                Ver gestão completa
              </Link>
            </header>

            <div className="profile-plans__status">
              <h3>Estado global</h3>
              <ul>
                <li className="tone-positive">
                  <span>Ativos</span>
                  <strong>{plans.statuses.active}</strong>
                </li>
                <li className="tone-warning">
                  <span>Rascunhos</span>
                  <strong>{plans.statuses.draft}</strong>
                </li>
                <li className="tone-neutral">
                  <span>Arquivados</span>
                  <strong>{plans.statuses.archived}</strong>
                </li>
                <li className="tone-critical">
                  <span>Removidos</span>
                  <strong>{plans.statuses.deleted}</strong>
                </li>
              </ul>
            </div>

            <div className="profile-plans__table">
              <header>
                <h3>Planos recentes</h3>
              </header>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Plano</th>
                    <th scope="col">Estado</th>
                    <th scope="col">PT responsável</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Actualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.recent.map((plan) => (
                    <tr key={plan.id}>
                      <th scope="row">{plan.title}</th>
                      <td>
                        <span className={`profile-status profile-status--${plan.statusTone}`}>
                          {plan.statusLabel}
                        </span>
                      </td>
                      <td>{plan.trainer}</td>
                      <td>{plan.client}</td>
                      <td>{plan.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
