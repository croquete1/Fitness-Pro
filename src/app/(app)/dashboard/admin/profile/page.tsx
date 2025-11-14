// src/app/(app)/dashboard/profile/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import AdminProfileClient from './AdminProfileClient';

const ADMIN_ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Cliente',
  PT: 'Personal Trainer',
  ADMIN: 'Administrador',
};

const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  PT: 'Personal Trainer',
  TRAINER: 'Personal Trainer',
  CLIENT: 'Cliente',
};

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  PENDING: 'Convite pendente',
  INVITED: 'Convite pendente',
  SUSPENDED: 'Suspenso',
  DISABLED: 'Inactivo',
};

const PLAN_STATUS_TONE: Record<string, string> = {
  ACTIVE: 'positive',
  APPROVED: 'positive',
  LIVE: 'positive',
  DRAFT: 'warning',
  WAITING: 'warning',
  PENDING: 'warning',
  PAUSED: 'warning',
  ARCHIVED: 'neutral',
  COMPLETED: 'neutral',
  FINISHED: 'neutral',
  DELETED: 'critical',
  CANCELLED: 'critical',
};

function formatDateLabel(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatUserRole(value: string | null): string {
  if (!value) return 'Outro';
  const key = value.toString().trim().toUpperCase();
  return USER_ROLE_LABELS[key] ?? 'Outro';
}

function formatUserStatus(value: string | null): string {
  if (!value) return 'Desconhecido';
  const key = value.toString().trim().toUpperCase();
  return USER_STATUS_LABELS[key] ?? 'Desconhecido';
}

function resolvePlanStatus(value: string | null) {
  if (!value) return { label: 'Indefinido', tone: 'warning' };
  const key = value.toString().trim().toUpperCase();
  const tone = PLAN_STATUS_TONE[key] ?? 'warning';
  let label = 'Indefinido';
  switch (key) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'LIVE':
      label = 'Ativo';
      break;
    case 'ARCHIVED':
    case 'COMPLETED':
    case 'FINISHED':
      label = 'Arquivado';
      break;
    case 'DELETED':
    case 'CANCELLED':
      label = 'Removido';
      break;
    case 'DRAFT':
    case 'WAITING':
    case 'PENDING':
    case 'PAUSED':
      label = 'Rascunho';
      break;
    default:
      label = 'Indefinido';
  }
  return { label, tone };
}

export default async function ClientProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

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
  const displayName = initial.name?.trim() || email || 'Perfil';
  const username = initial.username?.trim() || null;
  const phone = initial.phone?.trim() || null;
  const bio = initial.bio?.trim() || '';
  const roleLabelText = ADMIN_ROLE_LABELS[role] ?? 'Perfil';
  const aboutText = bio || 'Partilha a tua missão, experiência e foco para que a equipa conheça melhor o teu perfil.';
  const heroMeta = [
    `Email: ${email || '—'}`,
    username ? `Username: ${username}` : null,
    phone ? `Telefone: ${phone}` : null,
  ].filter(Boolean) as string[];
  const metrics = [
    {
      label: 'Username',
      value: username ?? '—',
      helper: username ? 'Identificador público visível em planos e relatórios.' : 'Define um username único para facilitar pesquisas.',
      tone: username ? 'neutral' : 'warning',
    },
    {
      label: 'Telefone',
      value: phone ?? '—',
      helper: phone ? 'Contacto disponível para a equipa.' : 'Adiciona um número para contactos rápidos.',
      tone: phone ? 'neutral' : 'warning',
    },
    {
      label: 'ID interno',
      value: session.user.id,
      helper: 'Identificador único desta conta.',
      tone: 'neutral',
    },
  ];
  const highlight = bio
    ? null
    : {
        tone: 'warning' as const,
        title: 'Completa a tua biografia',
        description: 'Partilha especializações, certificações e objectivos para melhorar a comunicação com a equipa.',
      };

  const teamTotals = { admin: 0, trainer: 0, client: 0, pending: 0, total: 0 };
  const teamRecent: Array<{ id: string; name: string; email: string | null; role: string; status: string; joined: string }> = [];

  try {
    const { data: teamData, error: teamError } = await sb
      .from('users')
      .select('id,name,email,role,status,created_at')
      .order('created_at', { ascending: false })
      .limit(16);

    if (teamError) {
      console.error('[admin-profile] falha ao carregar equipa', teamError);
    } else {
      (teamData ?? []).forEach((member: any) => {
        const id = String(member.id ?? crypto.randomUUID());
        const roleKey = typeof member.role === 'string' ? member.role.toUpperCase() : '';
        const statusKey = typeof member.status === 'string' ? member.status.toUpperCase() : '';

        teamTotals.total += 1;
        if (roleKey.includes('ADMIN')) teamTotals.admin += 1;
        else if (roleKey.includes('PT') || roleKey.includes('TRAINER')) teamTotals.trainer += 1;
        else teamTotals.client += 1;

        if (statusKey === 'INVITED' || statusKey === 'PENDING') teamTotals.pending += 1;

        teamRecent.push({
          id,
          name: member.name ?? member.email ?? 'Utilizador sem nome',
          email: member.email ?? null,
          role: formatUserRole(member.role ?? null),
          status: formatUserStatus(member.status ?? null),
          joined: formatDateLabel(member.created_at ?? null),
        });
      });
    }
  } catch (error) {
    console.error('[admin-profile] excepção ao carregar equipa', error);
  }

  const planStatuses = { active: 0, draft: 0, archived: 0, deleted: 0 };
  const planRecent: Array<{
    id: string;
    title: string;
    statusLabel: string;
    statusTone: string;
    trainer: string;
    client: string;
    updated: string;
  }> = [];

  try {
    const { data: planData, error: planError } = await sb
      .from('training_plans')
      .select(
        `id,title,status,updated_at,created_at,
        trainer:users!training_plans_trainer_id_fkey(name,email),
        client:users!training_plans_client_id_fkey(name,email)`,
      )
      .order('updated_at', { ascending: false })
      .limit(20);

    if (planError) {
      console.error('[admin-profile] falha ao carregar planos', planError);
    } else {
      (planData ?? []).forEach((plan: any) => {
        const id = String(plan.id ?? crypto.randomUUID());
        const statusKey = typeof plan.status === 'string' ? plan.status.toUpperCase() : '';

        if (['ACTIVE', 'APPROVED', 'LIVE'].includes(statusKey)) planStatuses.active += 1;
        else if (['ARCHIVED', 'COMPLETED', 'FINISHED'].includes(statusKey)) planStatuses.archived += 1;
        else if (['DELETED', 'CANCELLED'].includes(statusKey)) planStatuses.deleted += 1;
        else planStatuses.draft += 1;

        const { label, tone } = resolvePlanStatus(plan.status ?? null);
        const trainerLabel = plan.trainer?.name ?? plan.trainer?.email ?? 'Sem PT associado';
        const clientLabel = plan.client?.name ?? plan.client?.email ?? 'Sem cliente';
        const updatedLabel = formatDateLabel(plan.updated_at ?? plan.created_at ?? null);

        planRecent.push({
          id,
          title: plan.title ?? 'Plano sem título',
          statusLabel: label,
          statusTone: tone,
          trainer: trainerLabel,
          client: clientLabel,
          updated: updatedLabel,
        });
      });
    }
  } catch (error) {
    console.error('[admin-profile] excepção ao carregar planos', error);
  }

  return (
    <AdminProfileClient
      userId={String(session.user.id)}
      email={email}
      displayName={displayName}
      roleLabel={roleLabelText}
      aboutText={aboutText}
      heroMeta={heroMeta}
      metrics={metrics}
      highlight={highlight}
      initialForm={initial}
      team={{ totals: teamTotals, recent: teamRecent }}
      plans={{ statuses: planStatuses, recent: planRecent }}
    />
  );
}
