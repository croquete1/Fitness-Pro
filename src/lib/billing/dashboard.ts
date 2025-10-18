import {
  type BillingDashboardData,
  type BillingHighlight,
  type BillingInvoiceRecord,
  type BillingLedgerRow,
  type BillingMethodBreakdown,
  type BillingStatus,
  type BillingStatusSegment,
  type BillingTimelinePoint,
} from './types';

const CURRENCY = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const DATE_SHORT = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const DATE_LONG = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const METHOD_LABEL: Record<string, string> = {
  mbway: 'MB Way',
  visa: 'Visa',
  transfer: 'Transferência',
  multibanco: 'Multibanco',
  cash: 'Numerário',
};

const STATUS_LABEL: Record<BillingStatus, string> = {
  paid: 'Recebido',
  pending: 'Pendente',
  refunded: 'Reembolsado',
};

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const normalized = Number(value.replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : 0;
  }
  return 0;
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString();
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  return CURRENCY.format(value);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return DATE_SHORT.format(new Date(value));
  } catch (error) {
    console.warn('[billing-dashboard] formatDate', error);
    return '—';
  }
}

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  try {
    return DATE_LONG.format(new Date(value));
  } catch (error) {
    console.warn('[billing-dashboard] formatDateTime', error);
    return '—';
  }
}

function differenceInDays(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) return 0;
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));
}

function summarizeRange(records: BillingInvoiceRecord[]): {
  start: string | null;
  end: string | null;
  label: string;
  days: number;
} {
  if (!records.length) {
    return { start: null, end: null, label: 'Sem histórico', days: 0 };
  }
  const sorted = [...records]
    .map((record) => toIso(record.issuedAt))
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const start = sorted[0] ?? null;
  const end = sorted[sorted.length - 1] ?? null;
  if (!start || !end) {
    return { start, end, label: 'Sem histórico', days: 0 };
  }
  const label = `${DATE_SHORT.format(new Date(start))} – ${DATE_SHORT.format(new Date(end))}`;
  return { start, end, label, days: differenceInDays(start, end) };
}

function computeStatuses(records: BillingInvoiceRecord[]): BillingStatusSegment[] {
  const base: Record<'all' | BillingStatus, number> = { all: 0, paid: 0, pending: 0, refunded: 0 };
  for (const record of records) {
    base.all += 1;
    if (record.status === 'paid') base.paid += 1;
    else if (record.status === 'pending') base.pending += 1;
    else if (record.status === 'refunded') base.refunded += 1;
  }
  return [
    { id: 'all', label: 'Todos', count: base.all },
    { id: 'paid', label: 'Recebidos', count: base.paid },
    { id: 'pending', label: 'Pendentes', count: base.pending },
    { id: 'refunded', label: 'Reembolsos', count: base.refunded },
  ];
}

function computeMethods(records: BillingInvoiceRecord[]): BillingMethodBreakdown[] {
  const volumeByMethod = new Map<string, { volume: number; count: number }>();
  let totalVolume = 0;
  for (const record of records) {
    totalVolume += record.amount;
    const key = record.method ?? 'mbway';
    const current = volumeByMethod.get(key) ?? { volume: 0, count: 0 };
    current.volume += record.amount;
    current.count += 1;
    volumeByMethod.set(key, current);
  }
  return Array.from(volumeByMethod.entries())
    .map(([method, entry]) => ({
      method: method as BillingMethodBreakdown['method'],
      label: METHOD_LABEL[method] ?? method.toUpperCase(),
      count: entry.count,
      volume: entry.volume,
      share: totalVolume > 0 ? entry.volume / totalVolume : 0,
    }))
    .sort((a, b) => b.volume - a.volume);
}

function computeTimeline(records: BillingInvoiceRecord[]): BillingTimelinePoint[] {
  const map = new Map<string, { paid: number; pending: number; refunded: number; count: number }>();
  for (const record of records) {
    const iso = toIso(record.issuedAt);
    if (!iso) continue;
    const key = iso.slice(0, 10);
    if (!map.has(key)) {
      map.set(key, { paid: 0, pending: 0, refunded: 0, count: 0 });
    }
    const bucket = map.get(key)!;
    if (record.status === 'paid') bucket.paid += record.amount;
    if (record.status === 'pending') bucket.pending += record.amount;
    if (record.status === 'refunded') bucket.refunded += record.amount;
    bucket.count += 1;
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, bucket]) => ({
      date,
      totalVolume: bucket.paid + bucket.pending,
      paidVolume: bucket.paid,
      pendingVolume: bucket.pending,
      refundedVolume: bucket.refunded,
      invoiceCount: bucket.count,
    }));
}

function computeHighlights(records: BillingInvoiceRecord[]): BillingHighlight[] {
  if (!records.length) {
    return [
      {
        id: 'empty-ledger',
        title: 'Sem dados de faturação',
        description: 'Assim que registares vendas ou pagamentos vais ver métricas accionáveis aqui.',
        tone: 'info',
        value: '—',
      },
    ];
  }

  const outstanding = records
    .filter((record) => record.status === 'pending')
    .sort((a, b) => b.amount - a.amount);
  const mostOutstanding = outstanding[0] ?? null;

  const refunded = records.filter((record) => record.status === 'refunded');
  const latestRefund = refunded
    .slice()
    .sort((a, b) => {
      const aDate = new Date(a.refundedAt ?? a.paidAt ?? a.issuedAt).getTime();
      const bDate = new Date(b.refundedAt ?? b.paidAt ?? b.issuedAt).getTime();
      return bDate - aDate;
    })[0];

  const streakMap = new Map<string, number>();
  for (const record of records) {
    const key = record.clientName.toLowerCase();
    streakMap.set(key, (streakMap.get(key) ?? 0) + 1);
  }
  const [topClientKey, topClientCount] = Array.from(streakMap.entries()).sort((a, b) => b[1] - a[1])[0] ?? [
    null,
    0,
  ];
  const topClient = topClientKey
    ? records.find((record) => record.clientName.toLowerCase() === topClientKey)?.clientName ?? topClientKey
    : null;

  const highlights: BillingHighlight[] = [];

  if (mostOutstanding) {
    highlights.push({
      id: `pending-${mostOutstanding.id}`,
      title: 'Maior pendente',
      description: `${mostOutstanding.clientName} — vence a ${formatDate(mostOutstanding.dueAt)}`,
      tone: 'warning',
      value: formatCurrency(mostOutstanding.amount),
      meta: mostOutstanding.reference ?? undefined,
    });
  }

  if (latestRefund) {
    highlights.push({
      id: `refund-${latestRefund.id}`,
      title: 'Último reembolso',
      description: `${latestRefund.clientName} — emitido a ${formatDate(latestRefund.refundedAt ?? latestRefund.paidAt)}`,
      tone: 'danger',
      value: formatCurrency(latestRefund.amount),
      meta: latestRefund.serviceName,
    });
  }

  if (topClient && topClientCount > 1) {
    highlights.push({
      id: `loyal-${topClientKey}`,
      title: 'Cliente recorrente',
      description: `${topClient} com ${topClientCount} compras no período.`,
      tone: 'success',
      value: `${topClientCount} lançamentos`,
    });
  }

  if (!highlights.length) {
    highlights.push({
      id: 'healthy-ledger',
      title: 'Faturação em dia',
      description: 'Sem pendentes críticos nem reembolsos recentes. Mantém o ritmo!',
      tone: 'success',
      value: 'Equipa em alta',
    });
  }

  return highlights;
}

function normalizeLedger(records: BillingInvoiceRecord[]): BillingLedgerRow[] {
  return records
    .slice()
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .map((record) => ({
      ...record,
      statusLabel: STATUS_LABEL[record.status] ?? record.status,
      methodLabel: METHOD_LABEL[record.method] ?? record.method,
      amountLabel: formatCurrency(record.amount),
      issuedLabel: formatDateTime(record.issuedAt),
      dueLabel: formatDate(record.dueAt),
    }));
}

export function buildBillingDashboard(
  dataset: BillingInvoiceRecord[],
  options: { now?: Date } = {},
): BillingDashboardData {
  const records = dataset.map((record) => ({
    ...record,
    amount: toNumber(record.amount),
    issuedAt: toIso(record.issuedAt) ?? new Date().toISOString(),
    dueAt: toIso(record.dueAt),
    paidAt: toIso(record.paidAt),
    refundedAt: toIso(record.refundedAt),
  }));

  const totals = records.reduce(
    (acc, record) => {
      acc.volume += record.amount;
      if (record.status === 'paid') {
        acc.paid += record.amount;
      } else if (record.status === 'pending') {
        acc.outstanding += record.amount;
        acc.pending += record.amount;
      } else if (record.status === 'refunded') {
        acc.refunded += record.amount;
        acc.refundedCount += 1;
      }
      return acc;
    },
    { volume: 0, outstanding: 0, refunded: 0, paid: 0, pending: 0, refundedCount: 0 },
  );

  const range = summarizeRange(records);
  const statuses = computeStatuses(records);
  const methods = computeMethods(records);
  const timeline = computeTimeline(records);
  const highlights = computeHighlights(records);
  const ledger = normalizeLedger(records);

  const nextDue = records
    .filter((record) => record.status === 'pending')
    .filter((record) => {
      const dueDate = record.dueAt ?? record.issuedAt;
      return Boolean(dueDate);
    })
    .sort((a, b) => new Date(a.dueAt ?? a.issuedAt).getTime() - new Date(b.dueAt ?? b.issuedAt).getTime())[0] ?? null;

  return {
    generatedAt: (options.now ?? new Date()).toISOString(),
    range: {
      start: range.start,
      end: range.end,
      label: range.label,
      invoiceCount: records.length,
      days: range.days,
    },
    totals: {
      volume: totals.volume,
      outstanding: totals.outstanding,
      refunded: totals.refunded,
      average: records.length ? totals.volume / records.length : 0,
      paid: totals.paid,
      pending: totals.pending,
      refundedCount: totals.refundedCount,
    },
    statuses,
    methods,
    highlights,
    timeline,
    ledger,
    nextDue: nextDue
      ? {
          id: nextDue.id,
          dueAt: nextDue.dueAt ?? nextDue.issuedAt,
          amount: nextDue.amount,
          serviceName: nextDue.serviceName,
          clientName: nextDue.clientName,
        }
      : null,
  };
}
