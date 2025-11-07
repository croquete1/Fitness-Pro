import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildTrainerPlansDashboard } from './dashboard';
import type { TrainerPlanRecord, TrainerPlansDashboardData, TrainerPlanKind } from './types';
import { getTrainerPlansFallback } from '@/lib/fallback/trainer-plans';

const VALID_STATUSES = new Set(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED']);

type LoadResult = (TrainerPlansDashboardData & { ok: true; source: 'supabase' | 'fallback' });

type ProfilesMap = Map<string, { name: string | null }>;

type UsersMap = Map<string, { name: string | null; email: string | null }>;

function resolvePlanType(isTemplate: boolean, clientId: string | null): TrainerPlanKind {
  if (isTemplate) return 'template';
  if (clientId) return 'client';
  return 'unassigned';
}

function mapRow(row: any): TrainerPlanRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const clientId = row.client_id ? String(row.client_id) : null;
  const isTemplate = Boolean(row.is_template);
  const planType = resolvePlanType(isTemplate, clientId);
  const clientNameFallback =
    planType === 'template' ? 'Plano base' : planType === 'unassigned' ? 'Sem cliente' : 'Cliente sem nome';

  return {
    id,
    title: row.title ?? 'Plano sem título',
    status: typeof row.status === 'string' && VALID_STATUSES.has(row.status) ? row.status : row.status ?? null,
    clientId,
    clientName: row.client_name ?? row.client_full_name ?? row.client_email ?? clientNameFallback,
    clientEmail: row.client_email ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? row.created_at ?? null,
    isTemplate,
    templateId: row.template_id ?? null,
    planType,
  } satisfies TrainerPlanRecord;
}

async function hydrateClients(sb: ReturnType<typeof tryCreateServerClient>, rows: TrainerPlanRecord[]): Promise<void> {
  if (!sb) return;

  const clientIds = Array.from(new Set(rows.map((row) => row.clientId).filter(Boolean))) as string[];
  if (!clientIds.length) return;

  let profilesMap: ProfilesMap | null = null;
  try {
    const { data: profiles } = await sb
      .from('profiles')
      .select('id,full_name,name')
      .in('id', clientIds)
      .order('full_name', { ascending: true });
    profilesMap = new Map((profiles ?? []).map((profile) => [profile.id, { name: profile.full_name ?? profile.name ?? null }]));
  } catch (error) {
    console.warn('[trainer-plans] falha ao carregar perfis', error);
  }

  if (profilesMap) {
    rows.forEach((row) => {
      if (!row.clientId) return;
      const profile = profilesMap?.get(row.clientId);
      if (profile?.name) {
        row.clientName = profile.name;
      }
    });
  }

  const missingIds = rows.filter((row) => row.clientId && !row.clientName).map((row) => row.clientId) as string[];
  const uniqueMissing = Array.from(new Set(missingIds));
  if (!uniqueMissing.length) return;

  try {
    const { data: users } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', uniqueMissing);
    const usersMap: UsersMap = new Map(
      (users ?? []).map((user) => [user.id, { name: user.name ?? null, email: user.email ?? null }]),
    );
    rows.forEach((row) => {
      if (!row.clientId) return;
      const user = usersMap.get(row.clientId);
      if (user) {
        if (user.name && !row.clientName) {
          row.clientName = user.name;
        }
        if (user.email && !row.clientEmail) {
          row.clientEmail = user.email;
        }
      }
    });
  } catch (error) {
    console.warn('[trainer-plans] falha ao carregar utilizadores', error);
  }
}

export async function loadTrainerPlansDashboard(trainerId: string): Promise<LoadResult> {
  const fallback = getTrainerPlansFallback(trainerId);
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback' };
  }

  const { data, error } = await sb
    .from('training_plans')
    .select('id,title,status,client_id,start_date,end_date,created_at,updated_at,is_template,template_id')
    .eq('trainer_id', trainerId)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(360);

  if (error) {
    console.error('[trainer-plans] falha ao sincronizar com o servidor', error);
    return { ...fallback, ok: true, source: 'fallback' };
  }

  const rows = (data ?? []).map(mapRow);
  await hydrateClients(sb, rows);
  const dashboard = buildTrainerPlansDashboard(rows, { supabase: true });
  return { ...dashboard, ok: true, source: 'supabase' } satisfies LoadResult;
}
