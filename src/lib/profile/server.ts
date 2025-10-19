import { tryCreateServerClient } from '@/lib/supabaseServer';
import type { ClientSession, SessionRequest } from '@/lib/sessions/types';
import { buildProfileDashboard, type ProfileDashboardSource } from '@/lib/profile/dashboard';
import type { ProfileAccount, ProfileDashboardData } from '@/lib/profile/types';
import { getProfileDashboardFallback } from '@/lib/fallback/profile';

type SessionContext = {
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

type ProfileSessionRow = {
  id: string;
  trainer_id: string;
  client_id: string;
  scheduled_at: string;
  duration_min: number | null;
  location: string | null;
  notes: string | null;
  client_attendance_status: string | null;
  client_attendance_at: string | null;
};

type ProfileRequestRow = {
  id: string;
  session_id: string | null;
  trainer_id: string;
  requested_start: string | null;
  requested_end: string | null;
  proposed_start: string | null;
  proposed_end: string | null;
  status: string;
  message: string | null;
  trainer_note: string | null;
  reschedule_note: string | null;
  created_at: string | null;
  updated_at: string | null;
  responded_at: string | null;
  proposed_at: string | null;
};

type ProfileNotificationRow = {
  id: string;
  type: string | null;
  read: boolean;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
};

type ProfileDeviceQueryRow = {
  id: string;
  device: string | null;
  user_agent: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ProfileEventRow = {
  id: string;
  kind: string | null;
  action: string | null;
  category: string | null;
  note: string | null;
  created_at: string | null;
  details: Record<string, unknown> | null;
};

function computeEndIso(start: string | null, duration: number | null): string | null {
  if (!start || !duration) return null;
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return null;
  const end = new Date(date.getTime() + duration * 60_000);
  return end.toISOString();
}

function toClientSession(
  row: ProfileSessionRow,
  trainers: Map<string, { name: string | null; email: string | null }>,
): ClientSession {
  const trainer = trainers.get(row.trainer_id);
  return {
    id: row.id,
    startISO: row.scheduled_at ?? null,
    endISO: computeEndIso(row.scheduled_at ?? null, row.duration_min ?? null),
    durationMin: row.duration_min ?? null,
    location: row.location ?? null,
    notes: row.notes ?? null,
    trainerId: row.trainer_id ?? null,
    trainerName: trainer?.name ?? null,
    trainerEmail: trainer?.email ?? null,
    status: row.client_attendance_status ?? null,
    attendanceStatus: (row.client_attendance_status as ClientSession['attendanceStatus']) ?? 'pending',
    attendanceAt: row.client_attendance_at ?? null,
  } satisfies ClientSession;
}

function toSessionRequest(
  row: ProfileRequestRow,
  trainers: Map<string, { name: string | null; email: string | null }>,
): SessionRequest {
  const trainer = trainers.get(row.trainer_id);
  return {
    id: row.id,
    sessionId: row.session_id ?? null,
    status: (row.status as SessionRequest['status']) ?? 'pending',
    requestedStart: row.requested_start ?? null,
    requestedEnd: row.requested_end ?? null,
    proposedStart: row.proposed_start ?? null,
    proposedEnd: row.proposed_end ?? null,
    message: row.message ?? null,
    trainerNote: row.trainer_note ?? null,
    rescheduleNote: row.reschedule_note ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    respondedAt: row.responded_at ?? null,
    proposedAt: row.proposed_at ?? null,
    trainer: trainer ? { id: row.trainer_id, name: trainer.name, email: trainer.email } : null,
  } satisfies SessionRequest;
}

function toNotificationRow(row: ProfileNotificationRow) {
  return {
    id: row.id,
    type: row.type ?? null,
    read: Boolean(row.read),
    created_at: row.created_at ?? null,
    metadata: row.metadata ?? null,
  };
}

function toDeviceRow(row: ProfileDeviceQueryRow) {
  return {
    id: row.id,
    name: row.device ?? null,
    platform: null,
    device: row.device ?? null,
    user_agent: row.user_agent ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function toEventRow(row: ProfileEventRow) {
  return {
    id: row.id,
    kind: row.kind ?? null,
    action: row.action ?? null,
    category: row.category ?? null,
    note: row.note ?? null,
    created_at: row.created_at ?? null,
    details: row.details ?? null,
  };
}

function resolveAccount(
  userId: string,
  session: SessionContext | undefined,
  user: any,
  profile: any,
  priv: any,
): ProfileAccount {
  const email = user?.email ?? session?.email ?? 'utilizador@fitness.pro';
  return {
    id: userId,
    email,
    name: profile?.name ?? user?.name ?? session?.name ?? null,
    username: profile?.username ?? user?.username ?? null,
    avatarUrl: profile?.avatar_url ?? user?.avatar_url ?? null,
    role: user?.role ?? session?.role ?? null,
    phone: priv?.phone ?? null,
    birthDate: profile?.birthdate ?? null,
    bio: profile?.bio ?? null,
    createdAt: user?.created_at ?? null,
    updatedAt: profile?.updated_at ?? user?.updated_at ?? priv?.updated_at ?? null,
  } satisfies ProfileAccount;
}

async function loadTrainerDirectory(sb: ReturnType<typeof tryCreateServerClient>, trainerIds: string[]): Promise<Map<string, { name: string | null; email: string | null }>> {
  const uniqueIds = Array.from(new Set(trainerIds.filter(Boolean)));
  const map = new Map<string, { name: string | null; email: string | null }>();
  if (!uniqueIds.length) return map;

  const [{ data: userRows }, { data: profileRows }] = await Promise.all([
    sb.from('users').select('id,name,email').in('id', uniqueIds),
    sb.from('profiles').select('id,name').in('id', uniqueIds),
  ]);

  userRows?.forEach((row: any) => {
    map.set(row.id, { name: row.name ?? null, email: row.email ?? null });
  });

  profileRows?.forEach((row: any) => {
    const existing = map.get(row.id) ?? { name: null, email: null };
    if (row.name) existing.name = row.name;
    map.set(row.id, existing);
  });

  return map;
}

export type ProfileDashboardResult = {
  data: ProfileDashboardData;
  source: 'supabase' | 'fallback';
};

export async function loadProfileDashboard(
  userId: string,
  session: SessionContext = {},
): Promise<ProfileDashboardResult> {
  const sb = tryCreateServerClient();
  if (!sb) {
    return { data: getProfileDashboardFallback({ id: userId, email: session.email ?? undefined, name: session.name ?? undefined, role: session.role ?? undefined }), source: 'fallback' };
  }

  try {
    const [userRow, profileRow, privateRow] = await Promise.all([
      sb.from('users').select('id,email,name,username,avatar_url,role,created_at,updated_at').eq('id', userId).maybeSingle(),
      sb.from('profiles').select('name,username,bio,avatar_url,birthdate,updated_at').eq('id', userId).maybeSingle(),
      sb.from('profile_private').select('phone,updated_at').eq('user_id', userId).maybeSingle(),
    ]);

    const account = resolveAccount(userId, session, userRow.data ?? null, profileRow.data ?? null, privateRow.data ?? null);

    const [sessionsResult, requestsResult, notificationsResult, devicesResult, eventsResult] = await Promise.all([
      sb
        .from('sessions' as any)
        .select(
          'id,trainer_id,client_id,scheduled_at,duration_min,location,notes,client_attendance_status,client_attendance_at',
        )
        .eq('client_id', userId)
        .order('scheduled_at', { ascending: false })
        .limit(180),
      sb
        .from('session_requests' as any)
        .select(
          'id,session_id,trainer_id,requested_start,requested_end,proposed_start,proposed_end,status,message,trainer_note,reschedule_note,created_at,updated_at,responded_at,proposed_at',
        )
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(120),
      sb
        .from('notifications')
        .select('id,type,read,created_at,metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200),
      sb
        .from('push_subscriptions')
        .select('id,device,user_agent,created_at,updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20),
      sb
        .from('audit_log')
        .select('id,kind,action,category,note,created_at,details')
        .eq('actor_id', userId)
        .order('created_at', { ascending: false })
        .limit(40),
    ]);

    const trainerIds = [
      ...(sessionsResult.data ?? []).map((row: ProfileSessionRow) => row.trainer_id),
      ...(requestsResult.data ?? []).map((row: ProfileRequestRow) => row.trainer_id),
    ];
    const trainerDirectory = await loadTrainerDirectory(sb, trainerIds);

    const sessions: ClientSession[] = (sessionsResult.data ?? []).map((row: ProfileSessionRow) =>
      toClientSession(row, trainerDirectory),
    );
    const requests: SessionRequest[] = (requestsResult.data ?? []).map((row: ProfileRequestRow) =>
      toSessionRequest(row, trainerDirectory),
    );

    const notifications = (notificationsResult.data ?? []).map(toNotificationRow);
    const devices = (devicesResult.data ?? []).map((row: ProfileDeviceQueryRow) => toDeviceRow(row));
    const events = (eventsResult.data ?? []).map(toEventRow);

    const source: ProfileDashboardSource = {
      account,
      sessions,
      requests,
      notifications,
      devices,
      events,
    };

    const data: ProfileDashboardData = buildProfileDashboard(source, { now: new Date() });
    return { data, source: 'supabase' };
  } catch (error) {
    console.warn('[profile-dashboard] fallback devido a erro', error);
    return { data: getProfileDashboardFallback({ id: userId, email: session.email ?? undefined, name: session.name ?? undefined, role: session.role ?? undefined }), source: 'fallback' };
  }
}
