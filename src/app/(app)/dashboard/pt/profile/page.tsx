// src/app/(app)/dashboard/pt/profile/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { loadTrainerPlansDashboard } from '@/lib/trainer/plans/server';
import { loadMessagesDashboard } from '@/lib/messages/server';
import type { MessagesDashboardResponse } from '@/lib/messages/server';

import PTProfileClient from './PTProfileClient';

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
  ];
  const highlight = bio
    ? null
    : {
        tone: 'info' as const,
        title: 'Partilha a tua história',
        description: 'Uma biografia completa ajuda os clientes a confiar no teu acompanhamento.',
      };

  const trainerPlans = await loadTrainerPlansDashboard(session.user.id);
  const trainerMessages: MessagesDashboardResponse = await loadMessagesDashboard(session.user.id, 14);

  return (
    <PTProfileClient
      userId={String(session.user.id)}
      email={email}
      displayName={displayName}
      roleLabel={roleLabelText}
      aboutText={aboutText}
      heroMeta={heroMeta}
      metrics={metrics}
      highlight={highlight}
      initialForm={initial}
      trainerPlans={trainerPlans}
      messages={trainerMessages}
    />
  );
}
