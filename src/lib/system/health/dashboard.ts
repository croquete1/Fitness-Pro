import type {
  BuildSystemHealthOptions,
  SystemHealthDashboardData,
  SystemHealthDashboardInput,
  SystemHealthHeroMetric,
  SystemHealthMonitor,
  SystemHealthResilience,
  SystemHealthService,
  SystemHealthStatus,
} from './types';

const latencyFormatter = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const uptimeFormatter = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function formatLatency(value: number | null): string {
  if (!Number.isFinite(value) || value === null) return '—';
  if (value >= 1000) {
    const seconds = value / 1000;
    return `${latencyFormatter.format(seconds)} s`;
  }
  return `${latencyFormatter.format(value)} ms`;
}

function formatUptime(value: number | null): string {
  if (!Number.isFinite(value) || value === null) return '—';
  return `${uptimeFormatter.format(value)}%`;
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatRelative(value: string | null, now: Date): string | null {
  const parsed = parseDate(value);
  if (!parsed) return null;

  const diffMs = parsed.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
    { limit: 604_800_000, unit: 'day', size: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
    { limit: Infinity, unit: 'year', size: 31_556_952_000 },
  ];

  const bucket = thresholds.find((item) => absMs < item.limit) ?? thresholds[thresholds.length - 1];
  const valueRounded = Math.round(diffMs / bucket.size);
  return relativeFormatter.format(valueRounded, bucket.unit);
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (!finiteValues.length) return null;
  const sum = finiteValues.reduce((acc, value) => acc + value, 0);
  return sum / finiteValues.length;
}

function toServiceStateCounts(services: SystemHealthService[]): { total: number; ok: number; warn: number; down: number } {
  const totals = { total: services.length, ok: 0, warn: 0, down: 0 };
  services.forEach((service) => {
    if (service.state === 'down') totals.down += 1;
    else if (service.state === 'warn') totals.warn += 1;
    else totals.ok += 1;
  });
  return totals;
}

function toStatusCounts(records: Array<{ status: SystemHealthStatus }>): { total: number; warn: number; down: number } {
  const totals = { total: records.length, warn: 0, down: 0 };
  records.forEach((record) => {
    if (record.status === 'down') totals.down += 1;
    else if (record.status === 'warn') totals.warn += 1;
  });
  return totals;
}

function resolveOverallState(
  serviceTotals: { warn: number; down: number },
  monitorTotals: { warn: number; down: number },
  resilienceTotals: { warn: number; down: number },
): SystemHealthStatus {
  if (serviceTotals.down > 0 || monitorTotals.down > 0 || resilienceTotals.down > 0) return 'down';
  if (serviceTotals.warn > 0 || monitorTotals.warn > 0 || resilienceTotals.warn > 0) return 'warn';
  return 'ok';
}

function computeLatestTimestamp(
  services: SystemHealthService[],
  monitors: SystemHealthMonitor[],
  resilience: SystemHealthResilience[],
): string | null {
  const candidates: Date[] = [];
  services.forEach((service) => {
    const parsed = parseDate(service.updatedAt);
    if (parsed) candidates.push(parsed);
  });
  monitors.forEach((monitor) => {
    const parsed = parseDate(monitor.updatedAt);
    if (parsed) candidates.push(parsed);
  });
  resilience.forEach((entry) => {
    const parsed = parseDate(entry.updatedAt);
    if (parsed) candidates.push(parsed);
  });

  if (!candidates.length) return null;
  const latest = candidates.sort((a, b) => b.getTime() - a.getTime())[0];
  return latest.toISOString();
}

function buildHeroMetrics(
  services: SystemHealthService[],
  monitors: SystemHealthMonitor[],
  resilience: SystemHealthResilience[],
  serviceLatencyValues: number[],
  serviceUptimeValues: number[],
  lastUpdatedRelative: string | null,
): SystemHealthHeroMetric[] {
  const hero: SystemHealthHeroMetric[] = [];
  const serviceTotals = toServiceStateCounts(services);
  const monitorTotals = toStatusCounts(monitors);
  const resilienceTotals = toStatusCounts(resilience);

  const avgUptime = average(serviceUptimeValues);
  if (avgUptime !== null && serviceTotals.total > 0) {
    hero.push({
      key: 'availability',
      label: 'Disponibilidade média',
      value: formatUptime(avgUptime),
      hint: `${serviceTotals.ok}/${serviceTotals.total} serviços operacionais`,
      trend:
        serviceTotals.down > 0
          ? `${serviceTotals.down} incidente${serviceTotals.down === 1 ? '' : 's'} em aberto`
          : 'Sem incidentes em aberto',
      tone: avgUptime >= 99.5 ? 'positive' : avgUptime >= 98 ? 'warning' : 'critical',
    });
  }

  const avgLatency = average(serviceLatencyValues);
  if (avgLatency !== null && serviceTotals.total > 0) {
    hero.push({
      key: 'latency',
      label: 'Latência média',
      value: formatLatency(avgLatency),
      hint: `Últimas ${serviceLatencyValues.length} leituras`,
      trend:
        serviceTotals.warn > 0
          ? `${serviceTotals.warn} serviço${serviceTotals.warn === 1 ? '' : 's'} sob observação`
          : 'Sem alertas de latência',
      tone: avgLatency <= 400 ? 'positive' : avgLatency <= 900 ? 'warning' : 'critical',
    });
  }

  if (monitorTotals.total > 0) {
    const active = Math.max(monitorTotals.total - monitorTotals.down, 0);
    hero.push({
      key: 'monitors',
      label: 'Monitores activos',
      value: String(active),
      hint: `${monitorTotals.total} configurado${monitorTotals.total === 1 ? '' : 's'}`,
      trend:
        monitorTotals.down > 0
          ? `${monitorTotals.down} desligado${monitorTotals.down === 1 ? '' : 's'}`
          : monitorTotals.warn > 0
          ? `${monitorTotals.warn} em atenção`
          : 'Todos operacionais',
      tone: monitorTotals.down > 0 ? 'critical' : monitorTotals.warn > 0 ? 'warning' : 'positive',
    });
  }

  if (resilienceTotals.total > 0) {
    hero.push({
      key: 'resilience',
      label: 'Planos de resiliência',
      value: `${resilienceTotals.total - resilienceTotals.down}/${resilienceTotals.total}`,
      hint:
        resilienceTotals.down + resilienceTotals.warn > 0
          ? `${resilienceTotals.down + resilienceTotals.warn} por rever`
          : 'Cobertura total activa',
      trend: lastUpdatedRelative ? `Actualizado ${lastUpdatedRelative}` : 'Sem leituras recentes',
      tone:
        resilienceTotals.down > 0 ? 'critical' : resilienceTotals.warn > 0 ? 'warning' : 'positive',
    });
  }

  if (!hero.length) {
    hero.push({
      key: 'status',
      label: 'Monitorização',
      value: 'Sem dados',
      hint: 'Ainda não existem leituras registadas.',
      tone: 'neutral',
    });
  }

  return hero;
}

export function buildSystemHealthDashboard(
  input: SystemHealthDashboardInput,
  options: BuildSystemHealthOptions = {},
): SystemHealthDashboardData {
  const now = options.now ?? new Date();

  const services: SystemHealthService[] = input.services.map((service) => {
    const latencyValue = Number.isFinite(service.latencyMs) ? (service.latencyMs as number) : null;
    const uptimeValue = Number.isFinite(service.uptimePercent) ? (service.uptimePercent as number) : null;
    const incidents = Number.isFinite(service.incidents30d) ? Math.max(service.incidents30d ?? 0, 0) : 0;
    const trend = service.trendLabel?.trim().length
      ? service.trendLabel.trim()
      : incidents > 0
      ? `${incidents} incidente${incidents === 1 ? '' : 's'} nos últimos 30 dias`
      : 'Sem incidentes nas últimas 4 semanas';

    return {
      id: service.id,
      name: service.name,
      summary: service.summary ?? '',
      state: service.state,
      latency: formatLatency(latencyValue),
      uptime: formatUptime(uptimeValue),
      trend,
      updatedRelative: formatRelative(service.updatedAt, now) ?? '—',
      updatedAt: service.updatedAt,
    } satisfies SystemHealthService;
  });

  const monitors: SystemHealthMonitor[] = input.monitors.map((monitor) => ({
    id: monitor.id,
    title: monitor.title,
    detail: monitor.detail ?? '',
    status: monitor.status,
    updatedRelative: formatRelative(monitor.updatedAt, now) ?? '—',
    updatedAt: monitor.updatedAt,
  }));

  const resilience: SystemHealthResilience[] = input.resilience.map((entry) => ({
    id: entry.id,
    title: entry.title,
    detail: entry.detail ?? '',
    status: entry.status,
    updatedRelative: formatRelative(entry.updatedAt, now) ?? '—',
    updatedAt: entry.updatedAt,
  }));

  const serviceLatencyValues = input.services
    .map((service) => (Number.isFinite(service.latencyMs) ? (service.latencyMs as number) : null))
    .filter((value): value is number => value !== null);
  const serviceUptimeValues = input.services
    .map((service) => (Number.isFinite(service.uptimePercent) ? (service.uptimePercent as number) : null))
    .filter((value): value is number => value !== null);

  const serviceTotals = toServiceStateCounts(services);
  const monitorTotals = toStatusCounts(monitors);
  const resilienceTotals = toStatusCounts(resilience);

  const latestTimestamp = computeLatestTimestamp(services, monitors, resilience);
  const lastUpdatedRelative = latestTimestamp ? formatRelative(latestTimestamp, now) : null;

  const hero = buildHeroMetrics(
    services,
    monitors,
    resilience,
    serviceLatencyValues,
    serviceUptimeValues,
    lastUpdatedRelative,
  );

  return {
    generatedAt: now.toISOString(),
    hero,
    services,
    monitors,
    resilience,
    summary: {
      overallState: resolveOverallState(serviceTotals, monitorTotals, resilienceTotals),
      lastUpdatedAt: latestTimestamp,
      lastUpdatedRelative,
      serviceTotals,
      monitorTotals,
      resilienceTotals,
    },
  } satisfies SystemHealthDashboardData;
}
