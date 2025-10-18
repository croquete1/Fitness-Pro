import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildSystemDashboard } from './dashboard';
import {
  type SystemDashboardData,
  type SystemInvoiceRecord,
  type SystemNotificationRecord,
  type SystemSessionRecord,
  type SystemUserRecord,
  type SystemUserRole,
  type SystemUserStatus,
} from './types';
import { getSystemDashboardFallback } from '@/lib/fallback/system';

const SESSION_STATUS_MAP: Record<string, SystemSessionRecord['status']> = {
  completed: 'completed',
  confirmed: 'scheduled',
  scheduled: 'scheduled',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  pending: 'pending',
  rescheduled: 'rescheduled',
  no_show: 'missed',
};

const USER_ROLE_MAP: Record<string, SystemUserRole> = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  PT: 'trainer',
  CLIENT: 'client',
  STAFF: 'staff',
};

const USER_STATUS_MAP: Record<string, SystemUserStatus> = {
  ACTIVE: 'active',
  APPROVED: 'active',
  PENDING: 'pending',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
  DISABLED: 'archived',
};

const INVOICE_STATUS_MAP: Record<string, SystemInvoiceRecord['status']> = {
  paid: 'paid',
  pending: 'pending',
  refunded: 'refunded',
  cancelled: 'cancelled',
};

function mapUser(row: any): SystemUserRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const roleKey = typeof row.role === 'string' ? row.role.toUpperCase() : 'UNKNOWN';
  const statusKey = typeof row.status === 'string' ? row.status.toUpperCase() : 'UNKNOWN';
  const createdAt = row.created_at ?? null;
  const lastSeen = row.last_seen_at ?? row.last_sign_in_at ?? row.updated_at ?? null;
  return {
    id,
    role: USER_ROLE_MAP[roleKey] ?? 'unknown',
    status: USER_STATUS_MAP[statusKey] ?? 'unknown',
    createdAt: typeof createdAt === 'string' ? createdAt : null,
    lastSeenAt: typeof lastSeen === 'string' ? lastSeen : null,
  } satisfies SystemUserRecord;
}

type SessionEntry = {
  record: SystemSessionRecord;
  trainerId: string | null;
  clientId: string | null;
};

function mapSession(row: any): SessionEntry {
  const id = String(row.id ?? crypto.randomUUID());
  const attendanceStatus = typeof row.client_attendance_status === 'string' ? row.client_attendance_status.toLowerCase() : null;
  const statusKey = typeof row.status === 'string' ? row.status.toLowerCase() : attendanceStatus ?? 'unknown';
  const scheduledAt =
    row.scheduled_at ?? row.start_at ?? row.start_time ?? row.start_iso ?? row.startISO ?? null;
  const duration = row.duration_min ?? row.duration_minutes ?? row.duration ?? null;
  const trainerName = row.trainer_name ?? row.trainerFullName ?? row.trainer_full_name ?? null;
  const clientName = row.client_name ?? row.clientFullName ?? row.client_full_name ?? null;
  return {
    record: {
      id,
      status: SESSION_STATUS_MAP[statusKey] ?? (attendanceStatus ? SESSION_STATUS_MAP[attendanceStatus] ?? 'unknown' : 'unknown'),
      scheduledAt: typeof scheduledAt === 'string' ? scheduledAt : null,
      durationMinutes: typeof duration === 'number' ? duration : Number(duration ?? null) || null,
      trainerName: trainerName ?? null,
      clientName: clientName ?? null,
      location: row.location ?? null,
    },
    trainerId: row.trainer_id ?? row.trainerId ?? null,
    clientId: row.client_id ?? row.clientId ?? null,
  } satisfies SessionEntry;
}

function mapNotification(row: any): SystemNotificationRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const readFlag = row.read === true || row.status === 'READ';
  const createdAt = row.created_at ?? row.createdAt ?? null;
  const updatedAt = row.updated_at ?? row.updatedAt ?? null;
  return {
    id,
    status: readFlag ? 'delivered' : 'pending',
    channel: typeof row.channel === 'string' ? (row.channel as SystemNotificationRecord['channel']) : 'in-app',
    createdAt: typeof createdAt === 'string' ? createdAt : null,
    deliveredAt: readFlag ? (typeof updatedAt === 'string' ? updatedAt : null) : null,
    title: row.title ?? null,
    targetName: row.target_name ?? row.user_name ?? null,
  } satisfies SystemNotificationRecord;
}

function mapInvoice(row: any): SystemInvoiceRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const statusKey = typeof row.status === 'string' ? row.status.toLowerCase() : 'paid';
  const amountValue = typeof row.amount === 'number' ? row.amount : Number(row.amount ?? 0);
  return {
    id,
    status: INVOICE_STATUS_MAP[statusKey] ?? 'unknown',
    amount: Number.isFinite(amountValue) ? amountValue : 0,
    issuedAt: row.issued_at ?? row.issuedAt ?? null,
    paidAt: row.paid_at ?? row.paidAt ?? null,
    clientName: row.client_name ?? row.clientName ?? null,
  } satisfies SystemInvoiceRecord;
}

async function hydrateParticipantNames(
  sb: ReturnType<typeof tryCreateServerClient>,
  participants: SessionEntry[],
  notifications: SystemNotificationRecord[],
): Promise<void> {
  if (!sb) return;

  const ids = new Set<string>();
  for (const entry of participants) {
    if (entry.trainerId) ids.add(String(entry.trainerId));
    if (entry.clientId) ids.add(String(entry.clientId));
  }
  for (const notification of notifications) {
    const candidate = (notification as any).user_id ?? null;
    if (candidate) ids.add(String(candidate));
  }
  if (!ids.size) return;

  try {
    const { data } = await sb
      .from('profiles')
      .select('id,full_name,name')
      .in('id', Array.from(ids))
      .order('full_name', { ascending: true })
      .limit(400);
    const map = new Map<string, string>();
    (data ?? []).forEach((profile) => {
      const label = profile.full_name ?? profile.name ?? null;
      if (profile.id && label) {
        map.set(profile.id, label);
      }
    });
    participants.forEach((entry) => {
      if (entry.trainerId && !entry.record.trainerName) {
        entry.record.trainerName = map.get(entry.trainerId) ?? entry.record.trainerName;
      }
      if (entry.clientId && !entry.record.clientName) {
        entry.record.clientName = map.get(entry.clientId) ?? entry.record.clientName;
      }
    });
    notifications.forEach((notification) => {
      if (!notification.targetName) {
        const candidate = (notification as any).user_id ?? null;
        if (candidate && map.has(candidate)) {
          notification.targetName = map.get(candidate) ?? notification.targetName;
        }
      }
    });
  } catch (error) {
    console.warn('[system-dashboard] falha ao hidratar perfis', error);
  }
}

export type SystemDashboardResponse = SystemDashboardData & { ok: true; source: 'supabase' | 'fallback' };

export async function loadSystemDashboard(rangeDays = 14): Promise<SystemDashboardResponse> {
  const fallback = getSystemDashboardFallback(rangeDays);
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback' };
  }

  try {
    const now = new Date();
    const [usersResult, sessionsResult, notificationsResult, invoicesResult] = await Promise.all([
      sb
        .from('users')
        .select('id,role,status,created_at,last_sign_in_at,updated_at')
        .order('created_at', { ascending: false })
        .limit(720),
      sb
        .from('sessions')
        .select('id,trainer_id,client_id,scheduled_at,duration_min,location,client_attendance_status')
        .order('scheduled_at', { ascending: false })
        .limit(720),
      sb
        .from('notifications')
        .select('id,user_id,title,read,created_at,updated_at,type')
        .order('created_at', { ascending: false })
        .limit(720),
      sb
        .from('billing_invoices')
        .select('id,client_name,amount,status,issued_at,paid_at')
        .order('issued_at', { ascending: false })
        .limit(720),
    ]);

    const users: SystemUserRecord[] = (usersResult.data ?? []).map(mapUser);
    const sessionEntries = (sessionsResult.data ?? []).map(mapSession);
    const sessions: SystemSessionRecord[] = sessionEntries.map((entry) => entry.record);
    const notifications: SystemNotificationRecord[] = (notificationsResult.data ?? []).map((row: any) => {
      const record = mapNotification(row);
      (record as any).user_id = row.user_id ?? null;
      record.channel = 'in-app';
      return record;
    });
    const invoices: SystemInvoiceRecord[] = (invoicesResult.data ?? []).map(mapInvoice);

    await hydrateParticipantNames(sb, sessionEntries, notifications);

    const dashboard = buildSystemDashboard({
      now,
      rangeDays,
      users,
      sessions,
      notifications,
      invoices,
    });

    return { ...dashboard, ok: true, source: 'supabase' } satisfies SystemDashboardResponse;
  } catch (error) {
    console.error('[system-dashboard] falha ao sincronizar Supabase', error);
    return { ...fallback, ok: true, source: 'fallback' };
  }
}
