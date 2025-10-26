import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildMessagesDashboard } from './dashboard';
import type { MessageRecord, MessagesDashboardData } from './types';
import { getMessagesDashboardFallback } from '@/lib/fallback/messages';

const DAY_MS = 86_400_000;
const MIN_RANGE = 7;
const MAX_RANGE = 90;
const MAX_LOOKBACK = 180;

function clampRange(value: number | null | undefined): number {
  if (!Number.isFinite(value ?? null)) return 14;
  return Math.min(MAX_RANGE, Math.max(MIN_RANGE, Math.trunc(value ?? 14)));
}

function computeLookbackStart(rangeDays: number, now: Date = new Date()): Date {
  const safeRange = clampRange(rangeDays);
  const lookbackDays = Math.min(MAX_LOOKBACK, Math.max(safeRange * 2, safeRange + 14));
  const lookbackMs = Math.max(DAY_MS, lookbackDays * DAY_MS);
  const start = new Date(now.getTime() - lookbackMs);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export type MessagesDashboardResponse = MessagesDashboardData & { ok: true; source: 'supabase' | 'fallback' };

type MessageRow = {
  id?: string;
  body?: unknown;
  sent_at?: string | null;
  from_id?: string | null;
  to_id?: string | null;
  channel?: string | null;
  status?: string | null;
  read_at?: string | null;
  reply_to_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

function normaliseBody(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === 'string') return body;
  if (typeof body === 'object') {
    const maybe = (body as Record<string, unknown>).text ?? (body as Record<string, unknown>).body;
    if (typeof maybe === 'string') return maybe;
  }
  return null;
}

function extractChannel(row: MessageRow): string | null {
  if (row.channel && typeof row.channel === 'string') return row.channel;
  const meta = row.metadata ?? {};
  const candidate = [meta.channel, meta.origin, meta.source, meta.medium].find((value) => typeof value === 'string');
  return (candidate as string | undefined) ?? null;
}

export async function loadMessagesDashboard(viewerId: string, rangeDays = 14): Promise<MessagesDashboardResponse> {
  const safeRange = clampRange(rangeDays);
  const fallback = getMessagesDashboardFallback(viewerId, safeRange);
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback' };
  }

  try {
    const lookbackStart = computeLookbackStart(safeRange);
    const lookbackIso = lookbackStart.toISOString();
    const nowMs = Date.now();
    const daysBetween = Math.max(1, Math.round((nowMs - lookbackStart.getTime()) / DAY_MS));
    const limit = Math.min(2000, Math.max(480, daysBetween * 24));

    const query = sb
      .from('messages')
      .select('id,body,sent_at,from_id,to_id,channel,status,read_at,reply_to_id,metadata')
      .or(`from_id.eq.${viewerId},to_id.eq.${viewerId}`)
      .gte('sent_at', lookbackIso)
      .order('sent_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    const rows: MessageRow[] = Array.isArray(data) ? (data as MessageRow[]) : [];
    const participantIds = new Set<string>();
    for (const row of rows) {
      const fromId = row.from_id ?? null;
      const toId = row.to_id ?? null;
      if (fromId && fromId !== viewerId) participantIds.add(fromId);
      if (toId && toId !== viewerId) participantIds.add(toId);
    }

    const nameMap = new Map<string, string>();
    if (participantIds.size) {
      try {
        const { data: profiles } = await sb
          .from('profiles')
          .select('id,full_name,name')
          .in('id', Array.from(participantIds))
          .limit(360);
        (profiles ?? []).forEach((profile) => {
          if (profile && typeof profile.id === 'string') {
            const label =
              (typeof profile.full_name === 'string' && profile.full_name.trim().length > 0
                ? profile.full_name
                : typeof profile.name === 'string'
                ? profile.name
                : null) ?? null;
            if (label) {
              nameMap.set(profile.id, label);
            }
          }
        });
      } catch (error) {
        console.warn('[messages-dashboard] falha ao carregar nomes de perfis', error);
      }
    }

    const records: MessageRecord[] = rows.map((row) => {
      const fromId = row.from_id ?? null;
      const toId = row.to_id ?? null;
      const record: MessageRecord = {
        id: row.id ?? crypto.randomUUID(),
        body: normaliseBody(row.body ?? null),
        sentAt: typeof row.sent_at === 'string' ? row.sent_at : null,
        fromId,
        toId,
        fromName: fromId ? nameMap.get(fromId) ?? null : null,
        toName: toId ? nameMap.get(toId) ?? null : null,
        channel: extractChannel(row),
        status: typeof row.status === 'string' ? row.status : null,
        readAt: typeof row.read_at === 'string' ? row.read_at : null,
        replyToId: typeof row.reply_to_id === 'string' ? row.reply_to_id : null,
      };
      return record;
    });

    const dashboard = buildMessagesDashboard(records, { viewerId, rangeDays: safeRange });
    return { ...dashboard, ok: true, source: 'supabase' } satisfies MessagesDashboardResponse;
  } catch (error) {
    console.error('[messages-dashboard] erro ao carregar dados', error);
    return { ...fallback, ok: true, source: 'fallback' };
  }
}
