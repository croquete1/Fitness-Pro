import {
  type AdminApprovalBacklogRow,
  type AdminApprovalHeroMetric,
  type AdminApprovalHighlight,
  type AdminApprovalListRow,
  type AdminApprovalReviewerStat,
  type AdminApprovalRow,
  type AdminApprovalSlaOverview,
  type AdminApprovalStatus,
  type AdminApprovalStatusSegment,
  type AdminApprovalTimelinePoint,
  type AdminApprovalsDashboardData,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });

function toIso(value: unknown): string | null {
  if (!value) return null;
  try {
    const date = value instanceof Date ? value : new Date(value as string | number);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function diffHours(start: string | null, end: string | null, fallbackEnd: Date): number | null {
  const startDate = parseDate(start);
  if (!startDate) return null;
  const endDate = parseDate(end) ?? fallbackEnd;
  if (!endDate) return null;
  const diff = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(diff)) return null;
  return diff / 3_600_000;
}

function normaliseStatus(status: unknown): AdminApprovalStatus {
  if (!status) return 'pending';
  const raw = String(status).toLowerCase();
  if (raw.includes('reject') || raw.includes('denied') || raw.includes('suspend')) return 'rejected';
  if (raw.includes('approve') || raw === 'ok' || raw === 'accepted') return 'approved';
  if (raw.includes('pend')) return 'pending';
  return 'other';
}

function pickFirstDate(row: Record<string, any>, keys: string[]): string | null {
  for (const key of keys) {
    if (!(key in row)) continue;
    const iso = toIso(row[key]);
    if (iso) return iso;
  }
  return null;
}

function pickReviewer(row: Record<string, any>): { id: string | null; name: string | null } {
  const idCandidates = ['reviewer_id', 'reviewed_by', 'approved_by', 'decision_by', 'moderator_id'];
  for (const key of idCandidates) {
    if (row[key] == null) continue;
    const value = String(row[key]).trim();
    if (value) {
      const nameKey = `${key}_name`;
      const altKey = key === 'approved_by' ? 'approved_by_name' : key === 'reviewed_by' ? 'reviewed_by_name' : null;
      const nameValue =
        (altKey && row[altKey]) ||
        row[nameKey] ||
        row.reviewer_name ||
        row.moderator_name ||
        row.approver_name ||
        null;
      return {
        id: value,
        name: nameValue ? String(nameValue).trim() || null : null,
      };
    }
  }
  return { id: null, name: row.reviewer_name ? String(row.reviewer_name).trim() || null : null };
}

export function mapApprovalRow(row: Record<string, any>): AdminApprovalRow {
  const status = normaliseStatus(row.status ?? row.state ?? row.decision ?? row.outcome ?? 'pending');
  const requestedAt = pickFirstDate(row, [
    'requested_at',
    'request_at',
    'created_at',
    'inserted_at',
    'createdAt',
    'requestedAt',
  ]);
  const decidedAt = pickFirstDate(row, [
    'resolved_at',
    'decision_at',
    'decided_at',
    'approved_at',
    'updated_at',
    'updatedAt',
    'completed_at',
  ]);
  const reviewer = pickReviewer(row);
  const metadata = row.metadata && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>) : null;

  return {
    id: String(
      row.id ??
        row.approval_id ??
        row.request_id ??
        row.user_id ??
        row.uid ??
        row.member_id ??
        `approval-${Math.random().toString(36).slice(2)}`,
    ),
    userId: row.user_id != null ? String(row.user_id) : row.uid != null ? String(row.uid) : row.member_id != null ? String(row.member_id) : null,
    trainerId: row.trainer_id != null ? String(row.trainer_id) : row.coach_id != null ? String(row.coach_id) : null,
    name: row.name ?? row.full_name ?? row.profile_name ?? row.user_name ?? null,
    email: row.email ?? row.user_email ?? row.mail ?? null,
    status,
    requestedAt,
    decidedAt,
    reviewerId: reviewer.id,
    reviewerName: reviewer.name,
    channel: row.channel ?? row.source ?? row.origin ?? row.entry_channel ?? null,
    metadata,
  };
}

function computeStatusSegments(rows: AdminApprovalRow[]): AdminApprovalStatusSegment[] {
  const counters = new Map<AdminApprovalStatus, number>();
  rows.forEach((row) => {
    counters.set(row.status, (counters.get(row.status) ?? 0) + 1);
  });
  const labelMap: Record<AdminApprovalStatus, { label: string; tone: AdminApprovalStatusSegment['tone'] }> = {
    pending: { label: 'Pendentes', tone: 'warning' },
    approved: { label: 'Aprovados', tone: 'positive' },
    rejected: { label: 'Rejeitados', tone: 'danger' },
    other: { label: 'Outros', tone: 'neutral' },
  };
  return Array.from(counters.entries())
    .map(([status, count]) => ({
      id: status,
      count,
      label: labelMap[status].label,
      tone: labelMap[status].tone,
    }))
    .sort((a, b) => b.count - a.count);
}

function computeHeroMetrics(rows: AdminApprovalRow[], now: Date): {
  metrics: AdminApprovalHeroMetric[];
  pendingOver48h: number;
  avgSla: number | null;
  approvalsLast7d: number;
  approvalRate: number | null;
} {
  const pending = rows.filter((row) => row.status === 'pending');
  const approved = rows.filter((row) => row.status === 'approved');
  const rejected = rows.filter((row) => row.status === 'rejected');
  const decisions = [...approved, ...rejected];

  let sumSla = 0;
  let countSla = 0;
  let pendingOver48h = 0;

  pending.forEach((row) => {
    const waiting = diffHours(row.requestedAt, null, now);
    if (waiting != null && waiting > 48) pendingOver48h += 1;
  });

  decisions.forEach((row) => {
    const duration = diffHours(row.requestedAt, row.decidedAt, now);
    if (duration != null) {
      sumSla += duration;
      countSla += 1;
    }
  });

  const avgSla = countSla ? sumSla / countSla : null;
  const approvalRate = decisions.length ? (approved.length / decisions.length) * 100 : null;
  const approvalsLast7d = approved.filter((row) => {
    const decidedAt = parseDate(row.decidedAt);
    if (!decidedAt) return false;
    return now.getTime() - decidedAt.getTime() <= 7 * DAY_MS;
  }).length;

  const metrics: AdminApprovalHeroMetric[] = [
    {
      id: 'approvals-pending',
      label: 'Pedidos pendentes',
      value: numberFormatter.format(pending.length),
      helper: pendingOver48h ? `${numberFormatter.format(pendingOver48h)} há mais de 48h` : 'Todos dentro do SLA',
      tone: pendingOver48h > 0 ? 'warning' : 'primary',
    },
  ];

  metrics.push({
    id: 'approvals-rate',
    label: 'Taxa de aprovação',
    value: approvalRate != null ? `${decimalFormatter.format(approvalRate)}%` : '—',
    helper: decisions.length ? `${numberFormatter.format(decisions.length)} decisões` : 'Sem decisões recentes',
    tone: approvalRate != null && approvalRate >= 75 ? 'positive' : decisions.length ? 'warning' : 'info',
  });

  metrics.push({
    id: 'approvals-sla',
    label: 'SLA médio',
    value: avgSla != null ? `${decimalFormatter.format(avgSla)}h` : '—',
    helper: countSla ? `${numberFormatter.format(countSla)} decisões com SLA calculado` : 'Sem decisões concluídas',
    tone: avgSla != null && avgSla <= 24 ? 'positive' : avgSla != null && avgSla <= 36 ? 'warning' : 'danger',
  });

  metrics.push({
    id: 'approvals-week',
    label: 'Aprovações (7 dias)',
    value: numberFormatter.format(approvalsLast7d),
    helper: approvalsLast7d ? 'Comparar com campanhas activas' : 'Sem aprovações recentes',
    tone: approvalsLast7d ? 'positive' : 'info',
  });

  return { metrics, pendingOver48h, avgSla, approvalsLast7d, approvalRate };
}

function computeTimeline(rows: AdminApprovalRow[], now: Date): AdminApprovalTimelinePoint[] {
  const points = new Map<string, { pending: number; approved: number; rejected: number }>();
  for (let i = 0; i < 14; i += 1) {
    const date = new Date(now.getTime() - i * DAY_MS);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString();
    points.set(key, { pending: 0, approved: 0, rejected: 0 });
  }

  rows.forEach((row) => {
    const requested = parseDate(row.requestedAt);
    if (requested) {
      const key = new Date(requested.getTime());
      key.setHours(0, 0, 0, 0);
      const iso = key.toISOString();
      if (!points.has(iso)) {
        points.set(iso, { pending: 0, approved: 0, rejected: 0 });
      }
      const entry = points.get(iso)!;
      entry.pending += 1;
    }

    if (row.status !== 'pending') {
      const decided = parseDate(row.decidedAt);
      if (decided) {
        const key = new Date(decided.getTime());
        key.setHours(0, 0, 0, 0);
        const iso = key.toISOString();
        if (!points.has(iso)) {
          points.set(iso, { pending: 0, approved: 0, rejected: 0 });
        }
        const entry = points.get(iso)!;
        if (row.status === 'approved') entry.approved += 1;
        else if (row.status === 'rejected') entry.rejected += 1;
      }
    }
  });

  return Array.from(points.entries())
    .map(([date, values]) => ({ date, ...values }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function computeBacklog(rows: AdminApprovalRow[], now: Date): AdminApprovalBacklogRow[] {
  return rows
    .filter((row) => row.status === 'pending')
    .map<AdminApprovalBacklogRow>((row) => ({
      id: row.id,
      name: row.name ?? null,
      email: row.email ?? null,
      requestedAt: row.requestedAt,
      waitingHours: diffHours(row.requestedAt, null, now) ?? 0,
      userId: row.userId ?? null,
      status: row.status,
    }))
    .sort((a, b) => b.waitingHours - a.waitingHours)
    .slice(0, 6);
}

function computeReviewers(rows: AdminApprovalRow[], now: Date): AdminApprovalReviewerStat[] {
  const reviewerMap = new Map<string, { id: string; name: string; approvals: number; durations: number[] }>();
  rows.forEach((row) => {
    if (row.status !== 'approved' && row.status !== 'rejected') return;
    const reviewerId = row.reviewerId ?? row.reviewerName ?? 'desconhecido';
    const reviewerName = row.reviewerName ?? (row.reviewerId ? `Revisor ${row.reviewerId}` : 'Desconhecido');
    if (!reviewerMap.has(reviewerId)) {
      reviewerMap.set(reviewerId, { id: reviewerId, name: reviewerName, approvals: 0, durations: [] });
    }
    const bucket = reviewerMap.get(reviewerId)!;
    if (row.status === 'approved') bucket.approvals += 1;
    const duration = diffHours(row.requestedAt, row.decidedAt, now);
    if (duration != null) bucket.durations.push(duration);
  });

  return Array.from(reviewerMap.values())
    .map<AdminApprovalReviewerStat>((bucket) => ({
      id: bucket.id,
      name: bucket.name,
      approvals: bucket.approvals,
      avgSlaHours: bucket.durations.length
        ? bucket.durations.reduce((acc, value) => acc + value, 0) / bucket.durations.length
        : null,
    }))
    .sort((a, b) => b.approvals - a.approvals || (a.avgSlaHours ?? Infinity) - (b.avgSlaHours ?? Infinity))
    .slice(0, 5);
}

function computeSla(decisions: AdminApprovalRow[], now: Date): AdminApprovalSlaOverview {
  const durations: number[] = [];
  decisions.forEach((row) => {
    const duration = diffHours(row.requestedAt, row.decidedAt, now);
    if (duration != null) durations.push(duration);
  });
  durations.sort((a, b) => a - b);
  const averageHours = durations.length
    ? durations.reduce((acc, value) => acc + value, 0) / durations.length
    : null;
  const percentileIndex = Math.ceil(durations.length * 0.9) - 1;
  const percentile90Hours = durations.length ? durations[Math.max(0, percentileIndex)] : null;
  const within24h = durations.filter((value) => value <= 24).length;
  const breached = durations.filter((value) => value > 24).length;
  return { averageHours, percentile90Hours, within24h, breached };
}

function buildHighlights({
  pendingOver48h,
  avgSla,
  approvalsLast7d,
  approvalRate,
  reviewers,
}: {
  pendingOver48h: number;
  avgSla: number | null;
  approvalsLast7d: number;
  approvalRate: number | null;
  reviewers: AdminApprovalReviewerStat[];
}): AdminApprovalHighlight[] {
  const highlights: AdminApprovalHighlight[] = [];

  if (pendingOver48h > 0) {
    highlights.push({
      id: 'backlog-alert',
      title: `${numberFormatter.format(pendingOver48h)} pedidos fora do SLA`,
      description: 'Prioriza estas análises para evitar bloqueios na atribuição de PTs.',
      tone: 'warning',
    });
  } else {
    highlights.push({
      id: 'backlog-ok',
      title: 'Backlog dentro do SLA',
      description: 'Todos os pedidos pendentes estão dentro das 48 horas definidas.',
      tone: 'positive',
    });
  }

  if (avgSla != null) {
    highlights.push({
      id: 'sla-status',
      title: `SLA médio em ${decimalFormatter.format(avgSla)} horas`,
      description:
        avgSla <= 24
          ? 'Mantém este tempo de resposta para acelerar a integração dos profissionais.'
          : 'Reforça a equipa de revisores para voltar a colocar o SLA abaixo das 24 horas.',
      tone: avgSla <= 24 ? 'positive' : avgSla <= 36 ? 'warning' : 'danger',
    });
  }

  if (approvalRate != null) {
    highlights.push({
      id: 'rate-status',
      title: `${decimalFormatter.format(approvalRate)}% de pedidos aprovados`,
      description:
        approvalRate >= 75
          ? 'Os filtros automáticos estão a qualificar bem as candidaturas.'
          : 'Revê os formulários para reduzir recusas evitáveis.',
      tone: approvalRate >= 75 ? 'positive' : 'info',
    });
  }

  if (reviewers.length) {
    const topReviewer = reviewers[0];
    highlights.push({
      id: 'reviewer-top',
      title: `${topReviewer.name} lidera em aprovações`,
      description: `${numberFormatter.format(topReviewer.approvals)} decisões concluídas recentemente com SLA médio ${
        topReviewer.avgSlaHours != null ? `${decimalFormatter.format(topReviewer.avgSlaHours)}h` : 'desconhecido'
      }`,
      tone: 'info',
    });
  }

  if (!approvalsLast7d) {
    highlights.push({
      id: 'no-approvals',
      title: 'Sem aprovações nos últimos 7 dias',
      description: 'Confirma se existem novos pedidos válidos à espera de análise.',
      tone: 'warning',
    });
  }

  return highlights.slice(0, 4);
}

export function buildAdminApprovalsDashboard(
  rows: AdminApprovalRow[],
  opts: { source: 'supabase' | 'fallback'; now?: Date; total?: number; supabaseConfigured?: boolean },
): AdminApprovalsDashboardData {
  const now = opts.now ?? new Date();
  const { metrics, pendingOver48h, avgSla, approvalsLast7d, approvalRate } = computeHeroMetrics(rows, now);
  const statuses = computeStatusSegments(rows);
  const timeline = computeTimeline(rows, now);
  const backlog = computeBacklog(rows, now);
  const reviewers = computeReviewers(rows, now);
  const sla = computeSla(rows.filter((row) => row.status !== 'pending'), now);
  const highlights = buildHighlights({
    pendingOver48h,
    avgSla,
    approvalsLast7d,
    approvalRate,
    reviewers,
  });

  return {
    ok: true,
    source: opts.source,
    generatedAt: now.toISOString(),
    sampleSize: rows.length,
    datasetSize: opts.total ?? rows.length,
    hero: metrics,
    highlights,
    statuses,
    timeline,
    backlog,
    reviewers,
    sla,
    _supabaseConfigured: opts.supabaseConfigured,
  };
}

export function mapDashboardRowsToList(rows: AdminApprovalRow[]): AdminApprovalListRow[] {
  return rows.map<AdminApprovalListRow>((row) => ({
    id: row.id,
    user_id: row.userId ?? row.id,
    name: row.name ?? null,
    email: row.email ?? null,
    status: row.status === 'rejected' || row.status === 'approved' ? row.status : 'pending',
    requested_at: row.requestedAt,
    metadata: row.metadata ?? undefined,
  }));
}

