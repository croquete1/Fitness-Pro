import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  startOfDay,
} from 'date-fns';

import type {
  ClientWalletDashboardData,
  ClientWalletDashboardSource,
  ClientWalletEntryView,
  ClientWalletHighlight,
  ClientWalletHeroMetric,
  ClientWalletTimelinePoint,
  ClientWalletTotals,
} from './types';

const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dayFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelative(value: string | null | undefined, now: Date): string {
  if (!value) return '—';
  const date = parseDate(value);
  if (!date) return '—';
  const diff = date.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; divisor: number }> = [
    { limit: 60_000, unit: 'second', divisor: 1_000 },
    { limit: 3_600_000, unit: 'minute', divisor: 60_000 },
    { limit: 86_400_000, unit: 'hour', divisor: 3_600_000 },
    { limit: 604_800_000, unit: 'day', divisor: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', divisor: 604_800_000 },
    { limit: 31_557_600_000, unit: 'month', divisor: 2_629_746_000 },
    { limit: Infinity, unit: 'year', divisor: 31_557_600_000 },
  ];
  const bucket = thresholds.find((item) => abs < item.limit) ?? thresholds[thresholds.length - 1]!;
  const valueRounded = Math.round(diff / bucket.divisor);
  return relativeFormatter.format(valueRounded, bucket.unit);
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatCurrency(amount: number, currency: string): string {
  if (!Number.isFinite(amount)) return '—';
  if (currency !== 'EUR') {
    try {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.warn('[client-wallet] unsupported currency', currency, error);
    }
  }
  return currencyFormatter.format(amount);
}

function normaliseRange(days: number): number {
  if (!Number.isFinite(days) || days < 7) return 30;
  if (days > 180) return 180;
  return Math.round(days);
}

type TimelineBucket = { credit: number; debit: number; net: number };

type NormalisedEntry = {
  id: string;
  description: string | null;
  amount: number;
  createdAt: string | null;
  date: Date | null;
};

function normaliseEntries(entries: ClientWalletDashboardSource['entries']): NormalisedEntry[] {
  return (entries ?? []).map((entry) => ({
    id: entry.id,
    description: entry.desc ?? null,
    amount: Number(entry.amount ?? 0),
    createdAt: entry.created_at ?? null,
    date: parseDate(entry.created_at),
  }));
}

function buildTimeline(
  rangeStart: Date,
  rangeEnd: Date,
  balance: number,
  entries: NormalisedEntry[],
): ClientWalletTimelinePoint[] {
  const buckets = new Map<string, TimelineBucket>();

  entries.forEach((entry) => {
    if (!entry.date) return;
    const key = isoDay(startOfDay(entry.date));
    const bucket = buckets.get(key) ?? { credit: 0, debit: 0, net: 0 };
    if (entry.amount >= 0) {
      bucket.credit += entry.amount;
    } else {
      bucket.debit += Math.abs(entry.amount);
    }
    bucket.net += entry.amount;
    buckets.set(key, bucket);
  });

  const orderedEntries = entries
    .slice()
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.getTime() - b.date.getTime();
    });

  const netTotal = orderedEntries.reduce((total, entry) => total + entry.amount, 0);
  const offset = balance - netTotal;

  let running = offset;
  const interval = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  return interval.map((day) => {
    const key = isoDay(day);
    const bucket = buckets.get(key) ?? { credit: 0, debit: 0, net: 0 };
    running += bucket.net;
    return {
      date: key,
      label: dayFormatter.format(day),
      credit: Number(bucket.credit.toFixed(2)),
      debit: Number(bucket.debit.toFixed(2)),
      net: Number(bucket.net.toFixed(2)),
      balance: Number(running.toFixed(2)),
    } satisfies ClientWalletTimelinePoint;
  });
}

function buildTotals(
  now: Date,
  timeline: ClientWalletTimelinePoint[],
  entries: NormalisedEntry[],
): ClientWalletTotals {
  const days = 30;
  const slice = timeline.slice(-days);
  const creditTotal = slice.reduce((total, point) => total + point.credit, 0);
  const debitTotal = slice.reduce((total, point) => total + point.debit, 0);
  const net = slice.reduce((total, point) => total + point.net, 0);

  const threshold = addDays(startOfDay(now), -29);
  let debitEntriesCount = 0;
  let debitEntriesValue = 0;

  entries.forEach((entry) => {
    if (!entry.date) return;
    if (differenceInCalendarDays(entry.date, threshold) < 0) return;
    if (entry.amount < 0) {
      debitEntriesCount += 1;
      debitEntriesValue += Math.abs(entry.amount);
    }
  });

  return {
    credits30d: Number(creditTotal.toFixed(2)),
    debits30d: Number(debitTotal.toFixed(2)),
    net30d: Number(net.toFixed(2)),
    avgDebit:
      debitEntriesCount > 0
        ? Number((debitEntriesValue / debitEntriesCount).toFixed(2))
        : null,
    entriesCount: entries.length,
    creditsCount: entries.filter((entry) => entry.amount >= 0).length,
    debitsCount: entries.filter((entry) => entry.amount < 0).length,
  } satisfies ClientWalletTotals;
}

function buildHero(
  totals: ClientWalletTotals,
  balance: number,
  currency: string,
): ClientWalletHeroMetric[] {
  const metrics: ClientWalletHeroMetric[] = [
    {
      id: 'balance',
      label: 'Saldo disponível',
      value: formatCurrency(balance, currency),
      hint: 'Carteira pronta a utilizar',
      tone: balance > 0 ? 'positive' : 'warning',
    },
    {
      id: 'credits-30d',
      label: 'Carregamentos (30d)',
      value: formatCurrency(totals.credits30d, currency),
      hint: `${totals.creditsCount} crédito(s)`,
      tone: totals.credits30d > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'debits-30d',
      label: 'Débitos (30d)',
      value: formatCurrency(totals.debits30d, currency),
      hint: `${totals.debitsCount} débito(s)`,
      tone: totals.debits30d > 0 ? 'warning' : 'neutral',
    },
  ];

  metrics.push({
    id: 'net-30d',
    label: 'Variação 30 dias',
    value: formatCurrency(totals.net30d, currency),
    hint: totals.avgDebit ? `Média débito ${formatCurrency(totals.avgDebit, currency)}` : null,
    tone: totals.net30d >= 0 ? 'positive' : 'warning',
    trend:
      totals.net30d > 0
        ? `+${formatCurrency(totals.net30d, currency)}`
        : totals.net30d < 0
        ? `−${formatCurrency(Math.abs(totals.net30d), currency)}`
        : null,
  });

  return metrics;
}

function buildHighlights(
  now: Date,
  totals: ClientWalletTotals,
  entries: NormalisedEntry[],
  currency: string,
): ClientWalletHighlight[] {
  const highlights: ClientWalletHighlight[] = [];

  const lastCredit = entries
    .filter((entry) => entry.amount > 0 && entry.date)
    .sort((a, b) => (a.date && b.date ? b.date.getTime() - a.date.getTime() : 0))[0];

  const largestDebit = entries
    .filter((entry) => entry.amount < 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];

  if (totals.net30d > 0) {
    highlights.push({
      id: 'net-positive',
      title: 'Saldo reforçado',
      description: `A carteira cresceu ${formatCurrency(totals.net30d, currency)} nos últimos 30 dias.`,
      tone: 'positive',
      icon: 'trending-up',
      meta: totals.avgDebit ? `Débito médio ${formatCurrency(totals.avgDebit, currency)}` : null,
    });
  } else if (totals.net30d < 0) {
    highlights.push({
      id: 'net-negative',
      title: 'Saldo em queda',
      description: `Utilização líquida de ${formatCurrency(Math.abs(totals.net30d), currency)} nos últimos 30 dias.`,
      tone: 'warning',
      icon: 'trending-down',
      meta: totals.avgDebit ? `Débito médio ${formatCurrency(totals.avgDebit, currency)}` : null,
    });
  } else {
    highlights.push({
      id: 'net-flat',
      title: 'Saldo estável',
      description: 'Sem variação líquida nos últimos 30 dias.',
      tone: 'neutral',
      icon: 'equal',
      meta: totals.avgDebit ? `Débito médio ${formatCurrency(totals.avgDebit, currency)}` : null,
    });
  }

  if (lastCredit) {
    highlights.push({
      id: 'last-credit',
      title: 'Último carregamento',
      description: `${formatCurrency(lastCredit.amount, currency)} ${formatRelative(lastCredit.createdAt, now)}.`,
      tone: 'positive',
      icon: 'wallet',
      meta: lastCredit.description,
    });
  }

  if (largestDebit && Math.abs(largestDebit.amount) > 0) {
    highlights.push({
      id: 'largest-debit',
      title: 'Maior utilização recente',
      description: `${formatCurrency(Math.abs(largestDebit.amount), currency)} debitados ${formatRelative(largestDebit.createdAt, now)}.`,
      tone: 'warning',
      icon: 'shopping-cart',
      meta: largestDebit.description,
    });
  }

  if (!entries.length) {
    highlights.push({
      id: 'no-movements',
      title: 'Sem movimentos registados',
      description: 'Ainda não foram registados carregamentos ou débitos na carteira.',
      tone: 'neutral',
      icon: 'info',
      meta: null,
    });
  }

  return highlights;
}

function buildEntries(
  now: Date,
  currency: string,
  entries: NormalisedEntry[],
  balance: number,
): ClientWalletEntryView[] {
  const ordered = entries
    .slice()
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.getTime() - b.date.getTime();
    });

  const netTotal = ordered.reduce((total, entry) => total + entry.amount, 0);
  const offset = balance - netTotal;

  let running = offset;
  const mapped = ordered.map((entry) => {
    running += entry.amount;
    const type = entry.amount >= 0 ? 'credit' : 'debit';
    const amountAbs = Math.abs(entry.amount);
    const sign = entry.amount >= 0 ? '+' : '−';
    const amountLabel = `${sign}${formatCurrency(amountAbs, currency)}`;
    const timeLabel = entry.createdAt ? dateTimeFormatter.format(new Date(entry.createdAt)) : '—';
    return {
      id: entry.id,
      description: entry.description,
      amount: entry.amount,
      amountLabel,
      type,
      createdAt: entry.createdAt,
      timeLabel,
      relative: formatRelative(entry.createdAt, now),
      balanceAfter: Number(running.toFixed(2)),
      balanceLabel: formatCurrency(running, currency),
    } satisfies ClientWalletEntryView;
  });

  return mapped.reverse();
}

export function buildClientWalletDashboard(
  source: ClientWalletDashboardSource,
): ClientWalletDashboardData {
  const now = source.now;
  const rangeDays = normaliseRange(source.rangeDays);
  const currency = source.wallet?.currency ?? 'EUR';
  const balance = Number(source.wallet?.balance ?? 0);

  const rangeStart = startOfDay(addDays(now, -(rangeDays - 1)));
  const rangeEnd = endOfDay(now);

  const entries = normaliseEntries(source.entries);
  const timeline = buildTimeline(rangeStart, rangeEnd, balance, entries);
  const totals = buildTotals(now, timeline, entries);
  const hero = buildHero(totals, balance, currency);
  const highlights = buildHighlights(now, totals, entries, currency);
  const mappedEntries = buildEntries(now, currency, entries, balance);

  const updatedRelative = source.wallet?.updated_at
    ? formatRelative(source.wallet.updated_at, now)
    : null;

  return {
    generatedAt: now.toISOString(),
    range: {
      start: rangeStart.toISOString(),
      end: rangeEnd.toISOString(),
      label: `Últimos ${rangeDays} dias`,
      days: rangeDays,
    },
    balance: {
      value: balance,
      label: formatCurrency(balance, currency),
      currency,
      updatedAt: source.wallet?.updated_at ?? null,
      updatedRelative,
    },
    hero,
    highlights,
    timeline,
    totals,
    entries: mappedEntries,
  } satisfies ClientWalletDashboardData;
}
