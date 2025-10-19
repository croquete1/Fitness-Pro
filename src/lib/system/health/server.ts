import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildSystemHealthDashboard } from './dashboard';
import type {
  SystemHealthDashboardResponse,
  SystemHealthMonitorRecord,
  SystemHealthResilienceRecord,
  SystemHealthServiceRecord,
  SystemHealthStatus,
} from './types';
import { getSystemHealthDashboardFallback } from '@/lib/fallback/system-health';

function toStatus(value: unknown): SystemHealthStatus {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (['down', 'critical', 'alert', 'error', 'offline'].includes(normalized)) return 'down';
  if (['warn', 'warning', 'caution', 'degraded'].includes(normalized)) return 'warn';
  return 'ok';
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value ?? NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapService(row: any): SystemHealthServiceRecord {
  const id = typeof row.id === 'string' && row.id.trim().length > 0 ? row.id : crypto.randomUUID();
  const name = typeof row.name === 'string' && row.name.trim().length > 0 ? row.name : 'Serviço';
  const summary = typeof row.description === 'string' ? row.description : null;
  const latencyCandidates = [row.latency_ms, row.latencyMs, row.latency];
  const uptimeCandidates = [row.uptime_percent, row.uptimePercent, row.uptime];
  const incidentsCandidates = [row.incidents_30d, row.incidents30d, row.incidents_last30, row.incidents_last_30];

  const latencyMs = latencyCandidates.map(toNumber).find((value) => value !== null) ?? null;
  const uptimePercent = uptimeCandidates.map(toNumber).find((value) => value !== null) ?? null;
  const incidents30d = incidentsCandidates.map(toNumber).find((value) => value !== null) ?? null;
  const trendLabel = typeof row.trend_label === 'string' && row.trend_label.trim().length > 0 ? row.trend_label : null;
  const updatedAt = typeof row.updated_at === 'string' ? row.updated_at : null;

  return {
    id,
    name,
    summary,
    state: toStatus(row.state),
    latencyMs,
    uptimePercent,
    trendLabel,
    incidents30d,
    updatedAt,
  } satisfies SystemHealthServiceRecord;
}

function mapMonitor(row: any): SystemHealthMonitorRecord {
  const id = typeof row.id === 'string' && row.id.trim().length > 0 ? row.id : crypto.randomUUID();
  const title = typeof row.title === 'string' && row.title.trim().length > 0 ? row.title : 'Monitor';
  const detail = typeof row.detail === 'string' ? row.detail : null;
  const updatedAt = typeof row.updated_at === 'string' ? row.updated_at : null;

  return {
    id,
    title,
    detail,
    status: toStatus(row.status),
    updatedAt,
  } satisfies SystemHealthMonitorRecord;
}

function mapResilience(row: any): SystemHealthResilienceRecord {
  const id = typeof row.id === 'string' && row.id.trim().length > 0 ? row.id : crypto.randomUUID();
  const title = typeof row.title === 'string' && row.title.trim().length > 0 ? row.title : 'Medida';
  const detail = typeof row.detail === 'string' ? row.detail : null;
  const updatedAt = typeof row.updated_at === 'string' ? row.updated_at : null;

  return {
    id,
    title,
    detail,
    status: toStatus(row.status),
    updatedAt,
  } satisfies SystemHealthResilienceRecord;
}

export async function loadSystemHealthDashboard(): Promise<SystemHealthDashboardResponse> {
  const fallback = getSystemHealthDashboardFallback();
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback' } satisfies SystemHealthDashboardResponse;
  }

  try {
    const [servicesResult, monitorsResult, resilienceResult] = await Promise.all([
      sb
        .from('system_services')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true }),
      sb
        .from('system_monitors')
        .select('*')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true }),
      sb
        .from('system_resilience_practices')
        .select('*')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true }),
    ]);

    if (servicesResult.error) throw servicesResult.error;
    if (monitorsResult.error) throw monitorsResult.error;
    if (resilienceResult.error) throw resilienceResult.error;

    const services = Array.isArray(servicesResult.data)
      ? (servicesResult.data as any[]).map(mapService)
      : [];
    const monitors = Array.isArray(monitorsResult.data)
      ? (monitorsResult.data as any[]).map(mapMonitor)
      : [];
    const resilience = Array.isArray(resilienceResult.data)
      ? (resilienceResult.data as any[]).map(mapResilience)
      : [];

    const dashboard = buildSystemHealthDashboard({ services, monitors, resilience });
    return { ...dashboard, ok: true, source: 'supabase' } satisfies SystemHealthDashboardResponse;
  } catch (error) {
    console.error('[system-health] erro ao carregar dados', error);
    return { ...fallback, ok: true, source: 'fallback' } satisfies SystemHealthDashboardResponse;
  }
}
