export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { fetchUserById } from '@/lib/userRepo';
import { fetchPresenceMap, summarizePresence } from '@/lib/presence';
import ClientProfileClient, {
  type ClientProfilePayload,
  type MeasurementSnapshot,
  type PlanSummary,
  type SessionSummary,
  type TrainerOption,
} from './profile.client';

export default async function UserProfileView({ params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await params;
  const session = await getSessionUserSafe();
  const me = session?.user; if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';

  const sb = createServerClient();

  // permissão: ADMIN sempre; PT se cliente seu; CLIENT só se for o próprio
  if (role !== 'ADMIN' && me.id !== targetId) {
    if (role === 'PT') {
      const { data: s } = await sb.from('sessions').select('id').eq('trainer_id', me.id).eq('client_id', targetId).limit(1);
      const { data: p } = await sb.from('training_plans').select('id').eq('trainer_id', me.id).eq('client_id', targetId).limit(1);
      if (!s?.length && !p?.length) notFound();
    } else {
      notFound();
    }
  }

  const u = await fetchUserById(targetId, { client: sb, withProfile: true });
  if (!u) notFound();

  const now = new Date();
  const nowIso = now.toISOString();

  const presenceMap = await fetchPresenceMap(sb, [targetId]);
  const presence = summarizePresence(presenceMap.get(String(targetId)), { now });
  const lastLoginAt = presence.lastLoginAt ?? u.last_sign_in_at ?? null;
  const lastSeenAt = presence.lastSeenAt ?? lastLoginAt;
  const isOnline = presence.online;

  const trainerLinkPromise = sb
    .from('trainer_clients')
    .select('trainer_id')
    .eq('client_id', targetId)
    .maybeSingle();

  const trainerOptionsPromise = sb
    .from('users')
    .select('id,name,email,role')
    .in('role', ['PT', 'TRAINER'])
    .order('name', { ascending: true })
    .limit(100);

  const plansPromise = sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id')
    .eq('client_id', targetId)
    .order('updated_at', { ascending: false })
    .limit(6);

  const upcomingSessionsPromise = sb
    .from('sessions')
    .select('id,scheduled_at,duration_min,location,notes,trainer_id')
    .eq('client_id', targetId)
    .gte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })
    .limit(6);

  const recentSessionsPromise = sb
    .from('sessions')
    .select('id,scheduled_at,duration_min,location,notes,trainer_id')
    .eq('client_id', targetId)
    .lt('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: false })
    .limit(6);

  const measurementPromise = sb
    .from('anthropometry')
    .select('*')
    .eq('client_id', targetId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const planCountPromise = sb
    .from('training_plans')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', targetId);

  const planActivePromise = sb
    .from('training_plans')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', targetId)
    .eq('status', 'ACTIVE');

  const planDraftPromise = sb
    .from('training_plans')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', targetId)
    .eq('status', 'DRAFT');

  const planArchivedPromise = sb
    .from('training_plans')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', targetId)
    .eq('status', 'ARCHIVED');

  const upcomingSessionsCountPromise = sb
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', targetId)
    .gte('scheduled_at', nowIso);

  const [
    trainerLink,
    trainerOptionsRes,
    plansRes,
    upcomingSessionsRes,
    recentSessionsRes,
    measurementRes,
    planCountRes,
    planActiveRes,
    planDraftRes,
    planArchivedRes,
    upcomingSessionsCountRes,
  ] = await Promise.all([
    trainerLinkPromise,
    trainerOptionsPromise,
    plansPromise,
    upcomingSessionsPromise,
    recentSessionsPromise,
    measurementPromise,
    planCountPromise,
    planActivePromise,
    planDraftPromise,
    planArchivedPromise,
    upcomingSessionsCountPromise,
  ]);

  const trainerOptionsRows = trainerOptionsRes.data ?? [];
  const trainerOptionMissingIds = trainerOptionsRows.filter((row: any) => !row.name).map((row: any) => String(row.id));
  let trainerProfileMap = new Map<string, any>();
  if (trainerOptionMissingIds.length) {
    const { data: profileRows } = await sb
      .from('profiles')
      .select('id,full_name,name,email')
      .in('id', trainerOptionMissingIds);
    trainerProfileMap = new Map((profileRows ?? []).map((row: any) => [String(row.id), row]));
  }

  const trainerOptions: TrainerOption[] = trainerOptionsRows.map((row: any) => {
    const profile = trainerProfileMap.get(String(row.id));
    const displayName = row.name ?? profile?.full_name ?? profile?.name ?? row.email ?? 'Sem nome';
    return {
      id: String(row.id),
      name: displayName,
      email: row.email ?? profile?.email ?? null,
    };
  });

  const trainerLookup = new Map<string, TrainerOption>();
  trainerOptions.forEach((option) => trainerLookup.set(option.id, option));

  const trainerIds = new Set<string>();
  const currentTrainerId = trainerLink?.data?.trainer_id ? String(trainerLink.data.trainer_id) : null;
  if (currentTrainerId) trainerIds.add(currentTrainerId);

  (plansRes.data ?? []).forEach((row: any) => {
    if (row.trainer_id) trainerIds.add(String(row.trainer_id));
  });
  (upcomingSessionsRes.data ?? []).forEach((row: any) => {
    if (row.trainer_id) trainerIds.add(String(row.trainer_id));
  });
  (recentSessionsRes.data ?? []).forEach((row: any) => {
    if (row.trainer_id) trainerIds.add(String(row.trainer_id));
  });

  const missingTrainerIds = Array.from(trainerIds).filter((id) => !trainerLookup.has(id));
  if (missingTrainerIds.length) {
    const { data: trainerRows } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', missingTrainerIds);
    const fetchProfilesForMissing = trainerRows?.filter((row: any) => !row.name).map((row: any) => String(row.id)) ?? [];
    let missingProfiles = new Map<string, any>();
    if (fetchProfilesForMissing.length) {
      const { data: rows } = await sb
        .from('profiles')
        .select('id,full_name,name,email')
        .in('id', fetchProfilesForMissing);
      missingProfiles = new Map((rows ?? []).map((row: any) => [String(row.id), row]));
    }
    (trainerRows ?? []).forEach((row: any) => {
      const profile = missingProfiles.get(String(row.id));
      const displayName = row.name ?? profile?.full_name ?? profile?.name ?? row.email ?? 'Sem nome';
      const option: TrainerOption = {
        id: String(row.id),
        name: displayName,
        email: row.email ?? profile?.email ?? null,
      };
      trainerLookup.set(option.id, option);
      if (!trainerOptions.find((existing) => existing.id === option.id)) {
        trainerOptions.push(option);
      }
    });
  }

  const currentTrainer = currentTrainerId ? trainerLookup.get(currentTrainerId) ?? null : null;

  const plans: PlanSummary[] = (plansRes.data ?? []).map((plan: any) => ({
    id: String(plan.id),
    title: plan.title ?? null,
    status: plan.status ?? null,
    updatedAt: plan.updated_at ?? null,
    trainerName: plan.trainer_id ? trainerLookup.get(String(plan.trainer_id))?.name ?? null : null,
  }));

  const toSessionSummary = (row: any): SessionSummary => ({
    id: String(row.id),
    scheduledAt: row.scheduled_at ?? null,
    durationMin: typeof row.duration_min === 'number' ? row.duration_min : row.duration_min ? Number(row.duration_min) : null,
    location: row.location ?? null,
    notes: row.notes ?? null,
    trainerName: row.trainer_id ? trainerLookup.get(String(row.trainer_id))?.name ?? null : null,
  });

  const upcomingSessions: SessionSummary[] = (upcomingSessionsRes.data ?? []).map(toSessionSummary);
  const recentSessions: SessionSummary[] = (recentSessionsRes.data ?? []).map(toSessionSummary);

  const measurementRow: any = measurementRes.data ?? null;
  const measurementData: MeasurementSnapshot | null = measurementRow
    ? {
        id: String(measurementRow.id),
        date: measurementRow.date ?? measurementRow.measured_at ?? null,
        weight: measurementRow.weight ?? measurementRow.weight_kg ?? null,
        height: measurementRow.height ?? measurementRow.height_cm ?? null,
        bodyFatPct: measurementRow.body_fat_pct ?? measurementRow.bodyFatPct ?? null,
        notes: measurementRow.notes ?? null,
        waist: measurementRow.waist ?? measurementRow.waist_cm ?? null,
        hip: measurementRow.hip ?? measurementRow.hip_cm ?? null,
        chest: measurementRow.chest ?? measurementRow.chest_cm ?? null,
        shoulders: measurementRow.shoulders ?? measurementRow.shoulders_cm ?? null,
        neck: measurementRow.neck ?? measurementRow.neck_cm ?? null,
        arm: measurementRow.arm ?? measurementRow.arm_cm ?? null,
        thigh: measurementRow.thigh ?? measurementRow.thigh_cm ?? null,
        calf: measurementRow.calf ?? measurementRow.calf_cm ?? null,
      }
    : null;

  const countValue = (res: any) => (res?.error ? 0 : res?.count ?? 0);

  const totalPlans = countValue(planCountRes);
  const activePlans = countValue(planActiveRes);
  const draftPlans = countValue(planDraftRes);
  const archivedPlans = countValue(planArchivedRes);
  const upcomingSessionsCount = countValue(upcomingSessionsCountRes);

  const lastPlanUpdate = plans.length ? plans[0].updatedAt : null;
  const lastSession = recentSessions.length ? recentSessions[0].scheduledAt : null;
  const latestMeasurement = measurementData?.date ?? null;
  const userLastSignIn = u.last_sign_in_at ?? null;
  const userUpdated = (u as any).updated_at ?? u.updated_at ?? null;
  const activityCandidates = [lastPlanUpdate, lastSession, latestMeasurement, userLastSignIn, userUpdated]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const payload: ClientProfilePayload = {
    viewer: {
      id: me.id,
      role,
    },
    user: {
      id: u.id,
      name: u.name ?? null,
      email: u.email ?? null,
      role: toAppRole(u.role ?? null) ?? 'CLIENT',
      status: u.status ?? null,
      createdAt: u.created_at ?? null,
      lastSignInAt: lastLoginAt,
      lastSeenAt,
      online: isOnline,
      avatarUrl: u.avatar_url ?? null,
      phone: u.phone ?? null,
      username: u.username ?? null,
    },
    trainer: {
      current: currentTrainer,
      options: trainerOptions.sort((a, b) => a.name.localeCompare(b.name, 'pt-PT')), // sorted for dropdown
      allowEdit: role === 'ADMIN' || role === 'PT',
    },
    plans,
    upcomingSessions,
    recentSessions,
    measurement: measurementData,
    activity: {
      totalPlans,
      activePlans,
      draftPlans,
      archivedPlans,
      upcomingSessions: upcomingSessionsCount,
      lastPlanUpdate,
      lastSession,
      lastActivity: activityCandidates.length ? activityCandidates[0] : null,
    },
  };

  return <ClientProfileClient {...payload} />;
}
