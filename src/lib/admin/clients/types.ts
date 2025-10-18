export type AdminClientStatusKey = 'active' | 'pending' | 'suspended' | 'inactive' | 'unknown';
export type AdminClientRiskLevel = 'healthy' | 'watch' | 'critical';

export type AdminClientRecord = {
  id: string;
  name: string | null;
  email: string | null;
  status: string | null;
  approved: boolean | null;
  active: boolean | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  lastSignInAt: string | null;
  trainerId: string | null;
  trainerName: string | null;
  goals: string[];
  tags: string[];
  sessionsCompleted30d: number;
  sessionsCompletedRange: number;
  sessionsScheduled7d: number;
  sessionsCancelled30d: number;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  walletBalance: number | null;
  walletCurrency: string | null;
  walletUpdatedAt: string | null;
  invoicesPaidTotal: number;
  invoicesPaidTotal30d: number;
  invoicesPendingTotal: number;
  invoicesPendingTotal30d: number;
  invoicesPaidCount: number;
  invoicesPendingCount: number;
  planCount: number;
  activePlanCount: number;
  lastPlanTitle: string | null;
  lastPlanUpdatedAt: string | null;
  satisfactionScore: number | null;
  churnRiskScore: number | null;
  engagementScore: number | null;
};

export type AdminClientHeroMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'positive' | 'warning' | 'danger';
  trend?: string | null;
};

export type AdminClientTimelinePoint = {
  week: string;
  label: string;
  newClients: number;
  activeClients: number;
  sessionsCompleted: number;
};

export type AdminClientDistributionSegment = {
  id: string;
  label: string;
  total: number;
  share: number;
  tone: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
};

export type AdminClientHighlight = {
  id: string;
  name: string;
  email: string | null;
  statusLabel: string;
  statusTone: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
  trainerName: string | null;
  helper: string;
  amount?: string;
};

export type AdminClientRow = {
  id: string;
  displayName: string;
  email: string | null;
  statusKey: AdminClientStatusKey;
  statusLabel: string;
  statusTone: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
  trainerName: string | null;
  walletLabel: string;
  walletValue: number;
  walletTone: 'positive' | 'warning' | 'danger' | 'neutral';
  spendLabel: string;
  spendValue: number;
  spendTone: 'positive' | 'warning' | 'neutral';
  sessionsLabel: string;
  sessionsTooltip: string;
  sessionsCompleted: number;
  sessionsScheduled: number;
  sessionsCancelled: number;
  nextSessionLabel: string;
  riskLevel: AdminClientRiskLevel;
  riskLabel: string;
  riskTone: 'positive' | 'warning' | 'danger';
  createdAt: string | null;
  lastActiveAt: string | null;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
};

export type AdminClientsDashboardData = {
  supabase: boolean;
  fallback: boolean;
  updatedAt: string;
  rangeWeeks: number;
  hero: AdminClientHeroMetric[];
  timeline: AdminClientTimelinePoint[];
  statuses: AdminClientDistributionSegment[];
  engagement: AdminClientDistributionSegment[];
  trainers: AdminClientDistributionSegment[];
  wallet: AdminClientDistributionSegment[];
  highlights: {
    atRisk: AdminClientHighlight[];
    revenue: AdminClientHighlight[];
    newcomers: AdminClientHighlight[];
  };
  rows: AdminClientRow[];
  filters: {
    trainers: Array<{ id: string; name: string; total: number }>;
  };
};

export type AdminClientsDashboardParams = {
  q?: string;
  status?: 'all' | AdminClientStatusKey;
  trainer?: 'all' | string;
  risk?: 'all' | AdminClientRiskLevel;
  range?: '12w' | '24w' | '36w';
  sort?: 'recent' | 'sessions' | 'spend' | 'risk';
  page?: number;
  pageSize?: number;
};

export type AdminClientsDashboardResponse = {
  ok: true;
  data: AdminClientsDashboardData;
};
