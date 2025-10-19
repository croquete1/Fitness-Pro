import type { ClientPlan } from '@/lib/plans/types';
import type {
  ClientPlanAgendaDay,
  ClientPlanDayItem,
  ClientPlanOverviewData,
  ClientPlanOverviewHighlight,
  ClientPlanOverviewMetric,
  ClientPlanOverviewRow,
  ClientPlanOverviewStatus,
} from './types';
import type { PlanStatusKey } from '@/lib/plans/types';

const DAY_MS = 86_400_000;
const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const STATUS_META: Record<PlanStatusKey, { label: string; tone: 'positive' | 'warning' | 'critical' | 'neutral' }> = {
  active: { label: 'Ativo', tone: 'positive' },
  draft: { label: 'Rascunho', tone: 'warning' },
  archived: { label: 'Arquivado', tone: 'neutral' },
  deleted: { label: 'Removido', tone: 'critical' },
  unknown: { label: 'Sem estado', tone: 'warning' },
};

function integer(value: number): string {
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Math.round(value));
}

function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', options ?? { day: '2-digit', month: 'short' }).format(date);
}

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
  const diff = day === 0 ? -6 : 1 - day; // ISO monday start
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function normaliseStatus(value: string | null | undefined): PlanStatusKey {
  if (!value) return 'unknown';
  const status = value.toString().trim().toUpperCase();
  switch (status) {
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
    case 'WAITING':
    case 'PENDING':
    case 'PAUSED':
      return 'draft';
    default:
      return 'unknown';
  }
}

function formatRelativeDays(days: number | null): string {
  if (!Number.isFinite(days ?? null) || days == null) return '—';
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days > 1) return `há ${Math.round(days)} dias`;
  if (days === -1) return 'amanhã';
  return `em ${Math.abs(Math.round(days))} dias`;
}

export function buildClientPlanOverview(
  plans: ClientPlan[],
  dayItems: ClientPlanDayItem[],
  opts: { now?: Date | string | number; rangeDays?: number; fallback?: boolean } = {},
): ClientPlanOverviewData {
  const now = opts.now ? new Date(opts.now) : new Date();
  const today = startOfDay(now);
  const rangeDays = Math.max(7, Math.min(28, Math.round(opts.rangeDays ?? 7)));
  const weekStart = startOfWeek(today);

  const perPlanDay = new Map<string, Map<number, number>>();
  const perPlanUnique = new Map<string, Set<string>>();

  dayItems.forEach((item, index) => {
    const planId = item.planId;
    const dayIndex = Number.isFinite(item.dayIndex) ? Math.max(0, Math.min(6, Math.trunc(item.dayIndex))) : null;
    if (!planId || dayIndex == null) return;
    const uniqueKey = `${planId}-${dayIndex}-${item.exerciseId ?? item.id ?? index}`;
    const uniqueSet = perPlanUnique.get(planId) ?? new Set<string>();
    if (uniqueSet.has(uniqueKey)) return;
    uniqueSet.add(uniqueKey);
    perPlanUnique.set(planId, uniqueSet);
    const dayMap = perPlanDay.get(planId) ?? new Map<number, number>();
    dayMap.set(dayIndex, (dayMap.get(dayIndex) ?? 0) + 1);
    perPlanDay.set(planId, dayMap);
  });

  let activePlans = 0;
  let draftPlans = 0;
  let archivedPlans = 0;
  let deletedPlans = 0;
  let upcomingPlans = 0;
  let stalePlans = 0;

  let latestUpdate: number | null = null;

  const statuses = new Map<PlanStatusKey, ClientPlanOverviewStatus>();
  (Object.keys(STATUS_META) as PlanStatusKey[]).forEach((key) => {
    statuses.set(key, { key, label: STATUS_META[key].label, tone: STATUS_META[key].tone, count: 0 });
  });

  const planRows: ClientPlanOverviewRow[] = plans.map((plan) => {
    const statusKey = normaliseStatus(plan.status);
    const statusMeta = STATUS_META[statusKey];
    const startDate = parseDate(plan.startDate);
    const endDate = parseDate(plan.endDate);
    const updatedAt = parseDate(plan.updatedAt ?? plan.createdAt ?? null);

    const dayMap = perPlanDay.get(plan.id) ?? new Map<number, number>();
    const exercisesPerWeek = Array.from(dayMap.values()).reduce((acc, value) => acc + value, 0);
    const trainingDays = Array.from(dayMap.entries()).reduce((acc, [_, value]) => (value > 0 ? acc + 1 : acc), 0);

    if (statusKey === 'active') activePlans += 1;
    if (statusKey === 'draft') draftPlans += 1;
    if (statusKey === 'archived') archivedPlans += 1;
    if (statusKey === 'deleted') deletedPlans += 1;

    const statusSummary = statuses.get(statusKey);
    if (statusSummary) statusSummary.count += 1;

    if (startDate && startDate.getTime() >= today.getTime()) {
      upcomingPlans += 1;
    }

    if (updatedAt) {
      if (!latestUpdate || updatedAt.getTime() > latestUpdate) {
        latestUpdate = updatedAt.getTime();
      }
      const diffDays = Math.round((today.getTime() - updatedAt.getTime()) / DAY_MS);
      if (diffDays >= 21 && statusKey === 'active') {
        stalePlans += 1;
      }
    }

    const startLabel = formatDate(plan.startDate, { day: '2-digit', month: 'short' });
    const endLabel = formatDate(plan.endDate, { day: '2-digit', month: 'short' });
    const updatedAtLabel = updatedAt ? formatDate(updatedAt.toISOString(), { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const updatedRelative = updatedAt
      ? formatRelativeDays(Math.round((today.getTime() - updatedAt.getTime()) / DAY_MS))
      : '—';

    return {
      id: plan.id,
      title: plan.title?.trim() || 'Plano de treino',
      status: statusKey,
      statusLabel: statusMeta.label,
      statusTone: statusMeta.tone,
      trainerName: plan.trainerName ?? null,
      trainerEmail: plan.trainerEmail ?? null,
      startDateLabel: startLabel,
      endDateLabel: endLabel,
      updatedAtLabel,
      updatedRelative,
      exercisesPerWeek,
      trainingDays,
      link: `/dashboard/my-plan/${plan.id}`,
      search: [
        plan.id,
        plan.title ?? '',
        plan.trainerName ?? '',
        plan.trainerEmail ?? '',
        statusMeta.label,
      ]
        .map((value) => value?.toString().toLowerCase() ?? '')
        .join(' '),
    } satisfies ClientPlanOverviewRow;
  });

  const agenda: ClientPlanAgendaDay[] = Array.from({ length: rangeDays }, (_, offset) => {
    const dayDate = new Date(weekStart.getTime() + offset * DAY_MS);
    const dayIndex = ((dayDate.getDay() + 6) % 7) as number;
    const items = planRows
      .map((plan) => {
        const count = perPlanDay.get(plan.id)?.get(dayIndex) ?? 0;
        if (!count) return null;
        return {
          planId: plan.id,
          planTitle: plan.title,
          status: plan.status,
          statusLabel: plan.statusLabel,
          statusTone: plan.statusTone,
          exercises: count,
          trainerName: plan.trainerName,
          trainerEmail: plan.trainerEmail,
        };
      })
      .filter((item): item is ClientPlanAgendaDay['items'][number] => Boolean(item))
      .sort((a, b) => b.exercises - a.exercises || a.planTitle.localeCompare(b.planTitle));

    return {
      offset,
      dayIndex,
      label: WEEKDAY_LABELS[dayIndex] ?? `Dia ${dayIndex + 1}`,
      dateLabel: new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
      }).format(dayDate),
      isToday: startOfDay(dayDate).getTime() === today.getTime(),
      totalExercises: items.reduce((acc, item) => acc + item.exercises, 0),
      items,
    } satisfies ClientPlanAgendaDay;
  });

  const uniqueAgendaDays = new Set<number>();
  agenda.forEach((day) => {
    if (day.totalExercises > 0) uniqueAgendaDays.add(day.dayIndex);
  });

  const totalExercisesThisWeek = agenda
    .filter((day) => day.offset < 7)
    .reduce((acc, day) => acc + day.totalExercises, 0);

  const hero: ClientPlanOverviewMetric[] = [
    {
      id: 'plans-active',
      label: 'Planos activos',
      value: integer(activePlans),
      hint: `${draftPlans} rascunho${draftPlans === 1 ? '' : 's'} · ${archivedPlans} arquivado${
        archivedPlans === 1 ? '' : 's'
      }`,
      tone: activePlans > 0 ? 'positive' : 'warning',
    },
    {
      id: 'agenda-week',
      label: 'Exercícios na semana',
      value: integer(totalExercisesThisWeek),
      hint: `${uniqueAgendaDays.size} dia${uniqueAgendaDays.size === 1 ? '' : 's'} com treino`,
      tone: totalExercisesThisWeek > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'plans-upcoming',
      label: 'Planos a iniciar',
      value: integer(upcomingPlans),
      hint: upcomingPlans > 0 ? 'Confirma a agenda e prepara o material.' : 'Sem novos planos agendados.',
      tone: upcomingPlans > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'last-update',
      label: 'Última actualização',
      value: latestUpdate ? formatRelativeDays(Math.round((today.getTime() - latestUpdate) / DAY_MS)) : '—',
      hint: stalePlans > 0 ? `${stalePlans} plano${stalePlans === 1 ? '' : 's'} sem revisão há 3 semanas.` : null,
      tone: stalePlans > 0 ? 'warning' : 'neutral',
    },
  ];

  const highlights: ClientPlanOverviewHighlight[] = [];
  if (upcomingPlans > 0) {
    highlights.push({
      id: 'upcoming',
      title: 'Novos planos prontos',
      description: `${upcomingPlans} plano${upcomingPlans === 1 ? '' : 's'} começam nos próximos dias.`,
      tone: 'positive',
      icon: 'calendar',
    });
  }
  if (draftPlans > 0) {
    highlights.push({
      id: 'drafts',
      title: 'Aguardam publicação',
      description: `${draftPlans} plano${draftPlans === 1 ? '' : 's'} ainda estão em rascunho.`,
      tone: 'warning',
      icon: 'plans',
    });
  }
  if (stalePlans > 0) {
    highlights.push({
      id: 'stale',
      title: 'Revisão recomendada',
      description: `${stalePlans} plano${stalePlans === 1 ? '' : 's'} não são actualizados há pelo menos 3 semanas.`,
      tone: 'warning',
      icon: 'alert',
    });
  }
  if (!highlights.length) {
    highlights.push({
      id: 'steady',
      title: 'Planos em dia',
      description: 'Todos os planos estão actualizados e alinhados com a tua agenda.',
      tone: 'positive',
      icon: 'check-circle',
    });
  }

  const statusFilters: ClientPlanOverviewStatus[] = [
    { key: 'all', label: 'Todos', tone: 'neutral', count: planRows.length },
    ...Array.from(statuses.values())
      .filter((status) => status.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((status) => ({
        key: status.key,
        label: status.label,
        tone: status.tone,
        count: status.count,
      })),
  ];

  return {
    hero,
    highlights,
    agenda,
    plans: planRows,
    statuses: statusFilters,
    updatedAt: now.toISOString(),
    fallback: Boolean(opts.fallback),
    rangeDays,
  } satisfies ClientPlanOverviewData;
}
