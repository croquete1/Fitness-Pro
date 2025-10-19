import { buildSystemHealthDashboard } from '@/lib/system/health/dashboard';
import type {
  SystemHealthDashboardData,
  SystemHealthDashboardInput,
  SystemHealthServiceRecord,
  SystemHealthMonitorRecord,
  SystemHealthResilienceRecord,
} from '@/lib/system/health/types';

function minutesAgo(base: Date, minutes: number): string {
  return new Date(base.getTime() - minutes * 60_000).toISOString();
}

function hoursAgo(base: Date, hours: number): string {
  return new Date(base.getTime() - hours * 3_600_000).toISOString();
}

function buildFallbackDataset(now: Date): SystemHealthDashboardInput {
  const services: SystemHealthServiceRecord[] = [
    {
      id: 'core-api',
      name: 'Core API',
      summary: 'Gateway Node + Supabase PostgREST a servir o backend principal.',
      state: 'ok',
      latencyMs: 210,
      uptimePercent: 99.92,
      trendLabel: '+0,4% nas últimas 24h',
      incidents30d: 1,
      updatedAt: minutesAgo(now, 3),
    },
    {
      id: 'supabase',
      name: 'Supabase',
      summary: 'Base de dados, storage e autenticação partilhada.',
      state: 'ok',
      latencyMs: 280,
      uptimePercent: 99.88,
      trendLabel: 'Sem oscilação',
      incidents30d: 0,
      updatedAt: minutesAgo(now, 5),
    },
    {
      id: 'jobs',
      name: 'Fila de jobs',
      summary: 'Processamento assíncrono de notificações e syncs externos.',
      state: 'warn',
      latencyMs: 640,
      uptimePercent: 98.7,
      trendLabel: 'Reprocessamento automático activo',
      incidents30d: 3,
      updatedAt: minutesAgo(now, 8),
    },
    {
      id: 'analytics',
      name: 'Metabase',
      summary: 'Dashboards internos e monitorização de KPIs operacionais.',
      state: 'ok',
      latencyMs: 420,
      uptimePercent: 99.2,
      trendLabel: 'Sem alertas nas últimas 48h',
      incidents30d: 0,
      updatedAt: hoursAgo(now, 2),
    },
  ];

  const monitors: SystemHealthMonitorRecord[] = [
    {
      id: 'uptimerobot',
      title: 'Uptime Robot',
      detail: '30 localizações a monitorizar endpoints públicos e privados.',
      status: 'ok',
      updatedAt: minutesAgo(now, 2),
    },
    {
      id: 'slo-apdex',
      title: 'Apdex & SLO',
      detail: '98% das respostas abaixo de 300 ms em média semanal.',
      status: 'warn',
      updatedAt: minutesAgo(now, 7),
    },
    {
      id: 'alerts',
      title: 'Alertas automáticos',
      detail: 'Integração Slack #fitness-pro-ops com fallback por email.',
      status: 'ok',
      updatedAt: minutesAgo(now, 4),
    },
  ];

  const resilience: SystemHealthResilienceRecord[] = [
    {
      id: 'backups',
      title: 'Backups incrementais',
      detail: 'Intervalo de 30 minutos · retenção de 14 dias.',
      status: 'ok',
      updatedAt: hoursAgo(now, 1.5),
    },
    {
      id: 'failover',
      title: 'Failover multi-região',
      detail: 'Replica pronta em Frankfurt com DNS automatizado.',
      status: 'ok',
      updatedAt: hoursAgo(now, 6),
    },
    {
      id: 'circuit-breaker',
      title: 'Circuit breaker',
      detail: 'Retry exponencial até 3 tentativas antes de marcar falha.',
      status: 'ok',
      updatedAt: minutesAgo(now, 30),
    },
  ];

  return { services, monitors, resilience } satisfies SystemHealthDashboardInput;
}

export function getSystemHealthDashboardFallback(): SystemHealthDashboardData {
  const now = new Date();
  return buildSystemHealthDashboard(buildFallbackDataset(now), { now });
}

export const fallbackSystemHealthDashboard = getSystemHealthDashboardFallback();
