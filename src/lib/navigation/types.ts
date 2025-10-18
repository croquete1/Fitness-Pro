export type NavigationRole = 'ADMIN' | 'TRAINER' | 'CLIENT';

export type NavigationQuickMetric = {
  id: string;
  label: string;
  value: string;
  tone: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
  hint?: string | null;
  href?: string | null;
  delta?: number | null;
  deltaLabel?: string | null;
};

export type NavigationHighlight = {
  id: string;
  title: string;
  description: string;
  href?: string | null;
  icon?: string | null;
  tone?: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
};

export type NavigationSummaryItem = {
  id: string;
  href: string;
  label: string;
  icon: string;
  description?: string | null;
  badge?: number | null;
  kpiLabel?: string | null;
  kpiValue?: string | null;
  tone?: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
  activePrefix?: string | string[] | null;
  exact?: boolean;
};

export type NavigationSummaryGroup = {
  id: string;
  title: string;
  items: NavigationSummaryItem[];
};

export type NavigationSummary = {
  role: NavigationRole;
  updatedAt: string;
  quickMetrics: NavigationQuickMetric[];
  highlights: NavigationHighlight[];
  navGroups: NavigationSummaryGroup[];
};

export type NavigationSummaryCounts = {
  approvalsPending?: number | null;
  notificationsUnread?: number | null;
  messagesUnread?: number | null;
  onboardingPending?: number | null;
  clientsActive?: number | null;
  trainersActive?: number | null;
  sessionsToday?: number | null;
  sessionsUpcoming?: number | null;
  plansActive?: number | null;
  invoicesPending?: number | null;
  revenueMonth?: number | null;
  revenuePending?: number | null;
  satisfactionScore?: number | null;
};

export type NavigationSummaryInput = {
  role: NavigationRole;
  now?: Date;
  counts: NavigationSummaryCounts;
};
