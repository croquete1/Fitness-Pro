import type {
  ClientPlan,
  PlanInsight,
  PlanStatusKey,
  PlanStatusSummary,
  PlanTimelinePoint,
  PlanTrainerStat,
  PlansDashboardData,
  PlansHeroMetric,
} from './types';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

const STATUS_MAP: Record<PlanStatusKey, { label: string; tone: 'positive' | 'warning' | 'critical' | 'neutral' }> = {
  draft: { label: 'Rascunhos', tone: 'warning' },
  active: { label: 'Ativos', tone: 'positive' },
  archived: { label: 'Arquivados', tone: 'neutral' },
  deleted: { label: 'Removidos', tone: 'critical' },
  unknown: { label: 'Sem estado', tone: 'warning' },
};

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
  const diff = day === 0 ? -6 : 1 - day; // ISO week (Monday start)
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function formatWeekLabel(date: Date) {
  const end = new Date(date.getTime() + 6 * DAY_MS);
  const startLabel = date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  const endLabel = end.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  return `${startLabel} – ${endLabel}`;
}

function normaliseStatus(value: string | null | undefined): PlanStatusKey {
  if (!value) return 'unknown';
  const status = value.toString().trim().toUpperCase();
  switch (status) {
    case 'ACTIVE':
    case 'LIVE':
    case 'APPROVED':
      return 'active';
    case 'DRAFT':
    case 'WAITING':
    case 'PENDING':
    case 'PAUSED':
      return 'draft';
    case 'ARCHIVED':
    case 'FINISHED':
    case 'COMPLETED':
      return 'archived';
    case 'DELETED':
    case 'CANCELLED':
      return 'deleted';
    default:
      return 'unknown';
  }
}

function describeStatus(key: PlanStatusKey): PlanStatusSummary {
  return {
    key,
    label: STATUS_MAP[key].label,
    tone: STATUS_MAP[key].tone,
    count: 0,
    percentage: 0,
  };
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatDuration(days: number | null) {
  if (!days || !Number.isFinite(days)) return '—';
  if (days < 14) return `${Math.round(days)} ${Math.round(days) === 1 ? 'dia' : 'dias'}`;
  const weeks = days / 7;
  if (weeks < 10) {
    const rounded = Number(weeks.toFixed(1));
    return `${formatNumber(rounded, rounded % 1 === 0 ? 0 : 1)} ${rounded === 1 ? 'semana' : 'semanas'}`;
  }
  const months = days / 30;
  const rounded = Number(months.toFixed(1));
  return `${formatNumber(rounded, rounded % 1 === 0 ? 0 : 1)} ${rounded === 1 ? 'mês' : 'meses'}`;
}

function formatRelativeDays(days: number | null) {
  if (days === null || !Number.isFinite(days)) return '—';
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days > 1) return `há ${Math.round(days)} dias`;
  if (days === -1) return 'amanhã';
  return `em ${Math.abs(Math.round(days))} dias`;
}

export function buildClientPlansDashboard(
  rows: ClientPlan[],
  opts: { supabase?: boolean; now?: Date | string | number; weeks?: number } = {},
): PlansDashboardData {
  const now = opts.now ? new Date(opts.now) : new Date();
  const weeks = Math.max(6, Math.min(26, opts.weeks ?? 12));
  const today = startOfDay(now);
  const weekStart = startOfWeek(new Date(today.getTime() - (weeks - 1) * WEEK_MS));

  const plans = rows
    .map((plan) => ({
      ...plan,
      title: plan.title?.trim() || 'Plano de treino',
      status: plan.status ?? null,
    }))
    .sort((a, b) => {
      const aDate = parseDate(a.updatedAt)?.getTime() ?? parseDate(a.createdAt)?.getTime() ?? 0;
      const bDate = parseDate(b.updatedAt)?.getTime() ?? parseDate(b.createdAt)?.getTime() ?? 0;
      return bDate - aDate;
    });

  const statuses = new Map<PlanStatusKey, PlanStatusSummary>();
  (Object.keys(STATUS_MAP) as PlanStatusKey[]).forEach((key) => {
    statuses.set(key, describeStatus(key));
  });

  const timeline: PlanTimelinePoint[] = [];
  const timelineMap = new Map<string, PlanTimelinePoint>();
  for (let i = 0; i < weeks; i += 1) {
    const date = new Date(weekStart.getTime() + i * WEEK_MS);
    const key = date.toISOString().slice(0, 10);
    const point: PlanTimelinePoint = {
      week: key,
      label: formatWeekLabel(date),
      created: 0,
      updated: 0,
      archived: 0,
    };
    timeline.push(point);
    timelineMap.set(key, point);
  }

  let activeCount = 0;
  let upcomingCount = 0;
  let staleCount = 0;
  let archivedThisMonth = 0;
  let totalDurationDays = 0;
  let durationSamples = 0;
  let lastUpdateDays: number | null = null;

  const trainerMap = new Map<string, PlanTrainerStat>();

  const monthAgo = today.getTime() - 30 * DAY_MS;

  plans.forEach((plan) => {
    const statusKey = normaliseStatus(plan.status);
    const statusSummary = statuses.get(statusKey);
    if (statusSummary) {
      statusSummary.count += 1;
    }

    const trainerId = plan.trainerId ?? plan.trainerEmail ?? `unknown-${plan.id}`;
    const trainer = trainerMap.get(trainerId) ?? {
      trainerId,
      trainerName: plan.trainerName ?? null,
      trainerEmail: plan.trainerEmail ?? null,
      active: 0,
      total: 0,
    };
    trainer.total += 1;
    if (statusKey === 'active') {
      trainer.active += 1;
    }
    trainerMap.set(trainerId, trainer);

    if (statusKey === 'active') {
      activeCount += 1;
    }

    const start = parseDate(plan.startDate);
    const end = parseDate(plan.endDate);
    const created = parseDate(plan.createdAt);
    const updated = parseDate(plan.updatedAt);

    if (start && start.getTime() >= today.getTime()) {
      upcomingCount += 1;
    }

    if (statusKey === 'archived' && updated && updated.getTime() >= monthAgo) {
      archivedThisMonth += 1;
    }

    if (updated) {
      const diffDays = Math.round((today.getTime() - startOfDay(updated).getTime()) / DAY_MS);
      if (lastUpdateDays === null || diffDays < lastUpdateDays) {
        lastUpdateDays = diffDays;
      }
    }

    if (updated) {
      const key = startOfWeek(updated).toISOString().slice(0, 10);
      const point = timelineMap.get(key);
      if (point) {
        point.updated += 1;
        if (statusKey === 'archived' || statusKey === 'deleted') {
          point.archived += 1;
        }
      }
    }

    if (created) {
      const key = startOfWeek(created).toISOString().slice(0, 10);
      const point = timelineMap.get(key);
      if (point) {
        point.created += 1;
      }
    }

    if (statusKey === 'active' && updated) {
      const staleCutoff = today.getTime() - 35 * DAY_MS;
      if (updated.getTime() < staleCutoff) {
        staleCount += 1;
      }
    }

    if (start && end && end.getTime() > start.getTime()) {
      const duration = (end.getTime() - start.getTime()) / DAY_MS;
      totalDurationDays += duration;
      durationSamples += 1;
    }
  });

  const totalCount = plans.length;
  const avgDuration = durationSamples > 0 ? totalDurationDays / durationSamples : null;
  const avgDurationLabel = formatDuration(avgDuration);
  const lastUpdateLabel = lastUpdateDays === null ? '—' : formatRelativeDays(lastUpdateDays);

  const statusSummaries = Array.from(statuses.values())
    .filter((summary) => summary.count > 0 || summary.key === 'active' || summary.key === 'draft')
    .map((summary) => ({
      ...summary,
      percentage: totalCount > 0 ? Math.round((summary.count / totalCount) * 100) : 0,
    }));

  const sortedStatuses = statusSummaries.sort((a, b) => b.count - a.count);

  const sortedTimeline = timeline.slice().sort((a, b) => (a.week < b.week ? -1 : 1));
  const lastWeek = sortedTimeline[sortedTimeline.length - 1];
  const prevWeek = sortedTimeline[sortedTimeline.length - 2];
  const activeTrend = lastWeek && prevWeek ? lastWeek.updated - prevWeek.updated : 0;
  const activeTrendLabel = activeTrend === 0 ? 'sem variação' : `${activeTrend > 0 ? '+' : ''}${activeTrend} vs semana anterior`;

  const hero: PlansHeroMetric[] = [
    {
      key: 'active',
      label: 'Planos ativos',
      value: formatNumber(activeCount),
      hint: totalCount > 0 ? `de ${formatNumber(totalCount)} no total` : null,
      trend: activeTrendLabel,
      tone: activeCount === 0 ? 'warning' : 'positive',
    },
    {
      key: 'upcoming',
      label: 'Planos a iniciar',
      value: formatNumber(upcomingCount),
      hint: upcomingCount > 0 ? 'confirma os detalhes com o teu PT' : null,
      trend: upcomingCount === 0 ? 'sem arranques previstos' : 'arranques programados',
      tone: upcomingCount > 0 ? 'positive' : 'neutral',
    },
    {
      key: 'duration',
      label: 'Duração média',
      value: avgDurationLabel,
      hint: durationSamples > 0 ? `${formatNumber(durationSamples)} plano(s)` : null,
      trend: durationSamples > 0 ? 'calculado pelos planos com datas' : 'sem datas definidas',
      tone: durationSamples > 0 ? 'neutral' : 'warning',
    },
    {
      key: 'last-update',
      label: 'Última atualização',
      value: lastUpdateLabel,
      hint: archivedThisMonth > 0 ? `${formatNumber(archivedThisMonth)} arquivado(s) este mês` : null,
      trend: lastUpdateDays === null ? 'aguarda sincronização' : 'histórico consolidado',
      tone: lastUpdateDays !== null && lastUpdateDays <= 14 ? 'positive' : 'warning',
    },
  ];

  const trainers = Array.from(trainerMap.values())
    .filter((trainer) => trainer.total > 0)
    .sort((a, b) => {
      if (b.active !== a.active) return b.active - a.active;
      return b.total - a.total;
    })
    .slice(0, 6);

  const insights: PlanInsight[] = [];
  if (upcomingCount > 0) {
    insights.push({
      id: 'upcoming',
      title: 'Prepara o arranque dos novos planos',
      description: `${formatNumber(upcomingCount)} plano(s) começam nos próximos dias. Confirma sessões, nutrição e materiais com antecedência.`,
      tone: 'positive',
    });
  }
  if (staleCount > 0) {
    insights.push({
      id: 'stale',
      title: 'Planos sem revisão recente',
      description: `${formatNumber(staleCount)} plano(s) ativos não têm atualizações há mais de 5 semanas. Valida se continuam alinhados com os objetivos.`,
      tone: 'warning',
    });
  }
  const draftCount = statuses.get('draft')?.count ?? 0;
  if (draftCount > 0) {
    insights.push({
      id: 'drafts',
      title: 'Conclui os rascunhos pendentes',
      description: `${formatNumber(draftCount)} plano(s) aguardam publicação. Ajusta o conteúdo e partilha para desbloquear progresso.`,
      tone: 'neutral',
    });
  }
  if (insights.length === 0) {
    insights.push({
      id: 'healthy',
      title: 'Os planos estão atualizados',
      description: 'Mantém o acompanhamento semanal com o teu PT para garantir evolução contínua.',
      tone: 'positive',
    });
  }

  statusSummaries.forEach((summary) => {
    if (totalCount > 0) {
      summary.percentage = Math.round((summary.count / totalCount) * 100);
    } else {
      summary.percentage = 0;
    }
  });

  return {
    rows: plans,
    hero,
    statuses: sortedStatuses,
    timeline: sortedTimeline,
    trainers,
    insights,
    updatedAt: now.toISOString(),
    fallback: opts.supabase === false,
  };
}
