import {
  type TrainerPlanRecord,
  type TrainerPlansDashboardData,
  type TrainerPlanStatusKey,
  type TrainerPlanStatusSummary,
  type TrainerPlanTimelinePoint,
  type TrainerPlansHeroMetric,
  type TrainerPlanHighlight,
  type TrainerPlanClientSnapshot,
  type TrainerPlanTableRow,
} from './types';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

const STATUS_TOKENS: Record<TrainerPlanStatusKey, { label: string; tone: 'positive' | 'warning' | 'critical' | 'neutral' }> = {
  draft: { label: 'Rascunho', tone: 'warning' },
  active: { label: 'Ativo', tone: 'positive' },
  archived: { label: 'Arquivado', tone: 'neutral' },
  deleted: { label: 'Removido', tone: 'critical' },
  unknown: { label: 'Indefinido', tone: 'warning' },
};

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const shortDateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(date: Date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function formatWeekLabel(date: Date) {
  const end = new Date(date.getTime() + 6 * DAY_MS);
  const startLabel = shortDateFormatter.format(date);
  const endLabel = shortDateFormatter.format(end);
  return `${startLabel} – ${endLabel}`;
}

function normaliseStatus(value: string | null | undefined): TrainerPlanStatusKey {
  if (!value) return 'unknown';
  const normalized = value.toString().trim().toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'LIVE':
      return 'active';
    case 'ARCHIVED':
    case 'COMPLETED':
    case 'FINISHED':
      return 'archived';
    case 'DELETED':
    case 'CANCELLED':
      return 'deleted';
    case 'DRAFT':
    case 'PENDING':
    case 'WAITING':
    case 'PAUSED':
      return 'draft';
    default:
      return 'unknown';
  }
}

function describeStatus(key: TrainerPlanStatusKey): TrainerPlanStatusSummary {
  const token = STATUS_TOKENS[key];
  return {
    id: key,
    label: token.label,
    tone: token.tone,
    count: 0,
    percentage: 0,
  };
}

function formatDuration(days: number | null) {
  if (!days || !Number.isFinite(days)) return '—';
  if (days < 14) {
    const rounded = Math.round(days);
    return `${rounded} ${rounded === 1 ? 'dia' : 'dias'}`;
  }
  const weeks = days / 7;
  if (weeks < 8) {
    const rounded = Number(weeks.toFixed(1));
    return `${rounded.toString().replace('.', ',')} ${rounded === 1 ? 'semana' : 'semanas'}`;
  }
  const months = days / 30;
  const rounded = Number(months.toFixed(1));
  return `${rounded.toString().replace('.', ',')} ${rounded === 1 ? 'mês' : 'meses'}`;
}

function formatRelativeDays(days: number | null) {
  if (days === null || !Number.isFinite(days)) return '—';
  if (days === 0) return 'hoje';
  if (days > 0) return `há ${Math.round(days)} dias`;
  return `em ${Math.abs(Math.round(days))} dias`;
}

function formatOptionalDate(value: string | null) {
  const date = parseDate(value);
  if (!date) return '—';
  return shortDateFormatter.format(date);
}

function formatOptionalDateTime(value: string | null) {
  const date = parseDate(value);
  if (!date) return '—';
  return dateTimeFormatter.format(date);
}

export function buildTrainerPlansDashboard(
  rows: TrainerPlanRecord[],
  opts: { now?: Date | string | number; supabase?: boolean; weeks?: number } = {},
): TrainerPlansDashboardData {
  const nowDate = opts.now ? new Date(opts.now) : new Date();
  const now = Number.isNaN(nowDate.getTime()) ? new Date() : nowDate;
  const weeks = Math.max(6, Math.min(26, opts.weeks ?? 12));
  const today = startOfDay(now);
  const weekStart = startOfWeek(new Date(today.getTime() - (weeks - 1) * WEEK_MS));

  const statuses = new Map<TrainerPlanStatusKey, TrainerPlanStatusSummary>();
  (Object.keys(STATUS_TOKENS) as TrainerPlanStatusKey[]).forEach((key) => {
    statuses.set(key, describeStatus(key));
  });

  const timeline: TrainerPlanTimelinePoint[] = [];
  const timelineMap = new Map<string, TrainerPlanTimelinePoint>();
  for (let i = 0; i < weeks; i += 1) {
    const date = new Date(weekStart.getTime() + i * WEEK_MS);
    const key = date.toISOString().slice(0, 10);
    const point: TrainerPlanTimelinePoint = {
      week: key,
      label: formatWeekLabel(date),
      created: 0,
      updated: 0,
      archived: 0,
    };
    timeline.push(point);
    timelineMap.set(key, point);
  }

  const clients = new Map<string, TrainerPlanClientSnapshot>();

  let totalDuration = 0;
  let durationSamples = 0;
  let upcomingStarts = 0;
  let stalePlans = 0;
  let draftsAwaiting = 0;
  let lastUpdatedAt: Date | null = null;

  const sorted = [...rows].sort((a, b) => {
    const aDate = parseDate(a.updatedAt)?.getTime() ?? parseDate(a.createdAt)?.getTime() ?? 0;
    const bDate = parseDate(b.updatedAt)?.getTime() ?? parseDate(b.createdAt)?.getTime() ?? 0;
    return bDate - aDate;
  });

  sorted.forEach((row) => {
    const statusKey = normaliseStatus(row.status);
    const statusSummary = statuses.get(statusKey);
    if (statusSummary) {
      statusSummary.count += 1;
    }
    if (statusKey === 'draft') {
      draftsAwaiting += 1;
    }

    const createdAt = parseDate(row.createdAt);
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;
    const startDate = parseDate(row.startDate);
    const endDate = parseDate(row.endDate);

    if (updatedAt && (!lastUpdatedAt || updatedAt.getTime() > lastUpdatedAt.getTime())) {
      lastUpdatedAt = updatedAt;
    }

    if (createdAt) {
      const weekKey = startOfWeek(createdAt).toISOString().slice(0, 10);
      const point = timelineMap.get(weekKey);
      if (point) point.created += 1;
    }

    if (updatedAt) {
      const weekKey = startOfWeek(updatedAt).toISOString().slice(0, 10);
      const point = timelineMap.get(weekKey);
      if (point) point.updated += 1;
    }

    if (statusKey === 'archived' && updatedAt) {
      const weekKey = startOfWeek(updatedAt).toISOString().slice(0, 10);
      const point = timelineMap.get(weekKey);
      if (point) point.archived += 1;
    }

    if (startDate) {
      const diff = startOfDay(startDate).getTime() - today.getTime();
      if (diff >= 0 && diff <= 14 * DAY_MS) {
        upcomingStarts += 1;
      }
    }

    if (statusKey === 'active' && updatedAt) {
      const diffDays = (today.getTime() - startOfDay(updatedAt).getTime()) / DAY_MS;
      if (diffDays > 21) {
        stalePlans += 1;
      }
    }

    if (startDate && endDate) {
      const duration = (startOfDay(endDate).getTime() - startOfDay(startDate).getTime()) / DAY_MS;
      if (Number.isFinite(duration) && duration > 0) {
        totalDuration += duration;
        durationSamples += 1;
      }
    }

    if (row.clientId) {
      const existing = clients.get(row.clientId) ?? {
        id: row.clientId,
        name: row.clientName ?? 'Cliente sem nome',
        email: row.clientEmail ?? null,
        activePlans: 0,
        totalPlans: 0,
        lastUpdate: updatedAt ? updatedAt.toISOString() : createdAt ? createdAt.toISOString() : null,
        lastUpdateLabel: updatedAt ? formatRelativeDays((today.getTime() - startOfDay(updatedAt).getTime()) / DAY_MS) : '—',
        tone: 'neutral' as const,
      } satisfies TrainerPlanClientSnapshot;

      if (row.clientName?.trim()) {
        existing.name = row.clientName.trim();
      }
      if (row.clientEmail?.trim()) {
        existing.email = row.clientEmail.trim();
      }

      existing.totalPlans += 1;
      if (statusKey === 'active') {
        existing.activePlans += 1;
      }
      const referenceDate = updatedAt ?? createdAt;
      if (referenceDate) {
        const referenceIso = referenceDate.toISOString();
        const lastIso = existing.lastUpdate;
        if (!lastIso || referenceIso > lastIso) {
          existing.lastUpdate = referenceIso;
          const diffDays = (today.getTime() - startOfDay(referenceDate).getTime()) / DAY_MS;
          existing.lastUpdateLabel = formatRelativeDays(Math.round(diffDays));
        }
      }
      clients.set(row.clientId, existing);
    }
  });

  const totalPlans = sorted.length || 1;
  statuses.forEach((entry) => {
    entry.percentage = Number(((entry.count / totalPlans) * 100).toFixed(1));
  });

  const activeCount = statuses.get('active')?.count ?? 0;
  const hero: TrainerPlansHeroMetric[] = [
    {
      id: 'active-plans',
      label: 'Planos ativos',
      value: numberFormatter.format(activeCount),
      hint: `${numberFormatter.format(sorted.length)} no total`,
      tone: 'positive',
    },
    {
      id: 'upcoming-starts',
      label: 'Arranques nas próximas 2 semanas',
      value: numberFormatter.format(upcomingStarts),
      hint: upcomingStarts > 0 ? 'Confirma disponibilidade e equipamentos.' : 'Nenhum arranque imediato.',
      tone: upcomingStarts > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'avg-duration',
      label: 'Duração média dos planos',
      value: formatDuration(durationSamples ? totalDuration / durationSamples : null),
      hint: durationSamples ? `${durationSamples} planos com datas definidas.` : 'Define datas nos planos para medir progresso.',
      tone: 'neutral',
    },
    {
      id: 'last-update',
      label: 'Última atualização',
      value: formatRelativeDays(
        lastUpdatedAt ? (today.getTime() - startOfDay(lastUpdatedAt).getTime()) / DAY_MS : null,
      ),
      hint: lastUpdatedAt ? formatOptionalDateTime(lastUpdatedAt.toISOString()) : 'Sem dados recentes.',
      tone: lastUpdatedAt ? 'neutral' : 'warning',
    },
  ];

  const highlights: TrainerPlanHighlight[] = [];
  if (upcomingStarts > 0) {
    highlights.push({
      id: 'highlight-upcoming',
      title: 'Clientes a iniciar plano',
      description: 'Verifica as avaliações físicas e envia material de boas-vindas antes do arranque.',
      value: `+${numberFormatter.format(upcomingStarts)}`,
      tone: 'positive',
    });
  }
  if (stalePlans > 0) {
    highlights.push({
      id: 'highlight-stale',
      title: 'Planos sem atualização recente',
      description: 'Revê a progressão e adiciona notas para os clientes que estão sem feedback há mais de 3 semanas.',
      value: numberFormatter.format(stalePlans),
      tone: 'warning',
    });
  }
  if (draftsAwaiting > 0) {
    highlights.push({
      id: 'highlight-drafts',
      title: 'Rascunhos por finalizar',
      description: 'Conclui a prescrição e envia para aprovação dos clientes antes da próxima sessão.',
      value: numberFormatter.format(draftsAwaiting),
      tone: 'critical',
    });
  }
  if (!highlights.length) {
    highlights.push({
      id: 'highlight-consistent',
      title: 'Planos em dia',
      description: 'Todos os planos ativos foram atualizados nas últimas semanas. Mantém esta cadência!',
      tone: 'positive',
      value: '✔',
    });
  }

  const clientSnapshots: TrainerPlanClientSnapshot[] = Array.from(clients.values())
    .map((client) => {
      const lastUpdateDate = parseDate(client.lastUpdate);
      const diffDays = lastUpdateDate
        ? (today.getTime() - startOfDay(lastUpdateDate).getTime()) / DAY_MS
        : null;
      const tone: TrainerPlanClientSnapshot['tone'] = diffDays !== null && diffDays > 30 ? 'warning' : 'positive';
      return {
        ...client,
        name: client.name || 'Cliente sem nome',
        tone,
        lastUpdateLabel: diffDays !== null ? formatRelativeDays(Math.round(diffDays)) : '—',
      } satisfies TrainerPlanClientSnapshot;
    })
    .sort((a, b) => {
      if (b.activePlans !== a.activePlans) return b.activePlans - a.activePlans;
      if (b.totalPlans !== a.totalPlans) return b.totalPlans - a.totalPlans;
      return (b.lastUpdate ?? '').localeCompare(a.lastUpdate ?? '');
    })
    .slice(0, 6);

  const tableRows: TrainerPlanTableRow[] = sorted.map((row) => {
    const statusKey = normaliseStatus(row.status);
    const token = STATUS_TOKENS[statusKey];
    return {
      id: row.id,
      title: row.title?.trim() || 'Plano sem título',
      status: statusKey,
      statusLabel: token.label,
      statusTone: token.tone,
      clientId: row.clientId,
      clientName: row.clientName ?? 'Cliente sem nome',
      clientEmail: row.clientEmail ?? null,
      startLabel: formatOptionalDate(row.startDate),
      endLabel: formatOptionalDate(row.endDate),
      updatedLabel: formatOptionalDateTime(row.updatedAt),
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    } satisfies TrainerPlanTableRow;
  });

  return {
    updatedAt: now.toISOString(),
    supabase: opts.supabase ?? true,
    hero,
    statuses: Array.from(statuses.values()),
    timeline,
    highlights,
    clients: clientSnapshots,
    rows: tableRows,
  } satisfies TrainerPlansDashboardData;
}
