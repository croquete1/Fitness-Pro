import type { ClientWalletEntryRow, ClientWalletRow } from '@/lib/client/dashboard/types';

export type ClientWalletHeroTone = 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';

export type ClientWalletHeroMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  tone?: ClientWalletHeroTone;
  trend?: string | null;
};

export type ClientWalletTimelinePoint = {
  date: string;
  label: string;
  credit: number;
  debit: number;
  net: number;
  balance: number;
};

export type ClientWalletHighlight = {
  id: string;
  title: string;
  description: string;
  tone: ClientWalletHeroTone;
  icon?: string;
  meta?: string | null;
};

export type ClientWalletEntryView = {
  id: string;
  description: string | null;
  amount: number;
  amountLabel: string;
  type: 'credit' | 'debit';
  createdAt: string | null;
  timeLabel: string;
  relative: string;
  balanceAfter: number;
  balanceLabel: string;
};

export type ClientWalletTotals = {
  credits30d: number;
  debits30d: number;
  net30d: number;
  avgDebit: number | null;
  entriesCount: number;
  creditsCount: number;
  debitsCount: number;
};

export type ClientWalletDashboardData = {
  generatedAt: string;
  range: {
    start: string;
    end: string;
    label: string;
    days: number;
  };
  balance: {
    value: number;
    label: string;
    currency: string;
    updatedAt: string | null;
    updatedRelative: string | null;
  };
  hero: ClientWalletHeroMetric[];
  highlights: ClientWalletHighlight[];
  timeline: ClientWalletTimelinePoint[];
  totals: ClientWalletTotals;
  entries: ClientWalletEntryView[];
};

export type ClientWalletDashboardResponse = ClientWalletDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

export type ClientWalletDashboardError = {
  ok: false;
  message: string;
};

export type ClientWalletDashboardSource = {
  now: Date;
  wallet: ClientWalletRow | null;
  entries: ClientWalletEntryRow[];
  rangeDays: number;
};
