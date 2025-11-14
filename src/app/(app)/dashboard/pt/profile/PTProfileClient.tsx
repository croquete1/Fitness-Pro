'use client';

import * as React from 'react';
import Link from 'next/link';

import ProfileHeroTabs, { type ProfileHeroTab } from '@/app/(app)/dashboard/profile/ProfileHeroTabs';
import ProfileForm from '@/app/(app)/dashboard/admin/profile/ProfileForm.client';
import ProfileMessagesPanel from '@/app/(app)/dashboard/profile/ProfileMessagesPanel';
import TrainerPlansPanel, { type TrainerPlansPanelData } from './TrainerPlansPanel';
import TrainerClientsPanel from './TrainerClientsPanel';
import type { MessagesDashboardResponse } from '@/lib/messages/server';

const DEFAULT_HIGHLIGHT = {
  tone: 'info' as const,
  title: 'Partilha a tua história',
  description: 'Uma biografia completa ajuda os clientes a confiar no teu acompanhamento.',
};

type PTProfileClientProps = {
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
  trainerPlans: TrainerPlansPanelData;
  messages: MessagesDashboardResponse;
};

export default function PTProfileClient({
  userId,
  email,
  displayName,
  roleLabel,
  aboutText,
  heroMeta,
  metrics,
  highlight,
  initialForm,
  trainerPlans,
  messages,
}: PTProfileClientProps) {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'plans' | 'clients' | 'messages' | 'settings'>('profile');
  const avatarUrl = initialForm.avatar_url ?? null;
  const resolvedHighlight = highlight ?? DEFAULT_HIGHLIGHT;

  const tabs = React.useMemo<
    ProfileHeroTab<'profile' | 'plans' | 'clients' | 'messages' | 'settings'>[]
  >(
    () => [
      { label: 'Perfil', value: 'profile', kind: 'local' },
      { label: 'Planos de treino', value: 'plans', kind: 'local' },
      { label: 'Clientes', value: 'clients', kind: 'local' },
      { label: 'Mensagens', value: 'messages', kind: 'local' },
      { label: 'Definições', value: 'settings', kind: 'link', href: '/dashboard/settings' },
    ],
    [],
  );

  return (
    <div className="profile-dashboard profile-shell">
      <section className="profile-dashboard__hero" aria-label="Resumo do perfil do PT">
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
                  Actualizar dados
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

          <ProfileHeroTabs<'profile' | 'plans' | 'clients' | 'messages' | 'settings'>
            tabs={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
            ariaLabel="Navegação do perfil do personal trainer"
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
                <p>Actualiza dados pessoais para que clientes e equipa tenham contextos actualizados.</p>
              </div>
            </header>
            <ProfileForm userId={userId} initial={initialForm} canEditPrivate />
          </section>
        </div>

        <div
          id="profile-panel-plans"
          role="tabpanel"
          aria-labelledby="profile-tab-plans"
          hidden={activeTab !== 'plans'}
        >
          <TrainerPlansPanel initialData={trainerPlans} />
        </div>

        <div
          id="profile-panel-clients"
          role="tabpanel"
          aria-labelledby="profile-tab-clients"
          hidden={activeTab !== 'clients'}
        >
          <TrainerClientsPanel initialData={trainerPlans} />
        </div>

        <div
          id="profile-panel-messages"
          role="tabpanel"
          aria-labelledby="profile-tab-messages"
          hidden={activeTab !== 'messages'}
        >
          <ProfileMessagesPanel initialData={messages} viewerRole="pt" />
        </div>
      </div>
    </div>
  );
}
