// src/app/(app)/dashboard/pt/profile/page.tsx
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import ProfileForm from '@/app/(app)/dashboard/admin/profile/ProfileForm.client';
import ProfileHeroTabs, { type ProfileHeroTab } from '@/app/(app)/dashboard/profile/ProfileHeroTabs';

const PT_ROLE_LABELS: Record<string, string> = {
  PT: 'Personal Trainer',
  ADMIN: 'Administrador',
};

export default async function PTProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb
    .from('profiles')
    .select('name, username, bio, avatar_url')
    .eq('id', session.user.id)
    .maybeSingle();

  const { data: priv } = await sb
    .from('profile_private')
    .select('phone')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const initial = {
    name: prof?.name ?? null,
    username: prof?.username ?? null,
    bio: prof?.bio ?? null,
    avatar_url: prof?.avatar_url ?? null,
    phone: priv?.phone ?? null,
  };

  const email = session.user.email ?? '';
  const avatarUrl = initial.avatar_url ?? null;
  const displayName = initial.name?.trim() || email || 'Personal Trainer';
  const username = initial.username?.trim() || null;
  const phone = initial.phone?.trim() || null;
  const bio = initial.bio?.trim() || '';
  const roleLabelText = PT_ROLE_LABELS[role] ?? 'Personal Trainer';
  const aboutText = bio || 'Explica a tua metodologia de treino, áreas de especialização e objectivos com os clientes.';
  const heroMeta = [
    `Email: ${email || '—'}`,
    username ? `Username: ${username}` : null,
    phone ? `Telefone: ${phone}` : null,
  ].filter(Boolean) as string[];
  const metrics = [
    {
      label: 'Clientes activos',
      value: '—',
      helper: 'Sincroniza o CRM para acompanhar os teus atletas.',
      tone: 'neutral',
    },
    {
      label: 'Telefone',
      value: phone ?? '—',
      helper: phone ? 'Contacto disponível para a equipa.' : 'Adiciona um número para agilizar a comunicação.',
      tone: phone ? 'neutral' : 'warning',
    },
    {
      label: 'Username',
      value: username ?? '—',
      helper: username ? 'Identificador público em planos e mensagens.' : 'Define um username para ser mais fácil encontrar-te.',
      tone: username ? 'neutral' : 'warning',
    },
  ] as const;
  const highlight = bio
    ? null
    : {
        tone: 'info',
        title: 'Partilha a tua história',
        description: 'Uma biografia completa ajuda os clientes a confiar no teu acompanhamento.',
      };
  const heroTabs: ProfileHeroTab[] = [
    { label: 'Perfil', href: '/dashboard/pt/profile', current: true },
    { label: 'Planos de treino', href: '/dashboard/pt/plans' },
    { label: 'Clientes', href: '/dashboard/pt/clients' },
    { label: 'Mensagens', href: '/dashboard/pt/messages' },
    { label: 'Definições', href: '/dashboard/settings' },
  ];

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
                <span className="profile-dashboard__heroRole">{roleLabelText}</span>
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

          <ProfileHeroTabs tabs={heroTabs} ariaLabel="Navegação do perfil do personal trainer" />

          {highlight ? (
            <div className={`profile-dashboard__highlight ${highlight.tone}`}>
              <div className="profile-dashboard__highlightContent">
                <strong>{highlight.title}</strong>
                <p>{highlight.description}</p>
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
                <dd>{phone ?? '—'}</dd>
              </div>
              <div>
                <dt>Username</dt>
                <dd>{username ?? '—'}</dd>
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
        <ProfileForm userId={String(session.user.id)} initial={initial} canEditPrivate />
      </section>
    </div>
  );
}
