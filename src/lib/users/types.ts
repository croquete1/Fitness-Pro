export type AdminUserRecord = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  approved: boolean | null;
  active: boolean | null;
  createdAt: string | null;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
  online?: boolean | null;
};

export type AdminUsersRow = {
  id: string;
  displayName: string;
  email: string | null;
  roleKey: AdminUserRoleKey;
  roleLabel: string;
  statusKey: AdminUserStatusKey;
  statusLabel: string;
  statusTone: 'positive' | 'warning' | 'critical' | 'neutral';
  approved: boolean;
  active: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  online: boolean;
};

export type AdminUsersHeroMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral';
};

export type AdminUsersTimelinePoint = {
  week: string;
  label: string;
  signups: number;
  active: number;
  pending: number;
};

export type AdminUsersDistribution = {
  key: string;
  label: string;
  total: number;
  percentage: number;
  tone?: 'positive' | 'warning' | 'critical' | 'neutral' | 'info';
};

export type AdminUsersHighlight = {
  id: string;
  name: string;
  email: string | null;
  roleLabel: string;
  statusLabel: string;
  statusTone: 'positive' | 'warning' | 'critical' | 'neutral';
  createdAt: string | null;
  lastSeenAt: string | null;
};

export type AdminUsersDashboardData = {
  supabase: boolean;
  fallback: boolean;
  updatedAt: string;
  hero: AdminUsersHeroMetric[];
  timeline: AdminUsersTimelinePoint[];
  roles: AdminUsersDistribution[];
  statuses: AdminUsersDistribution[];
  online: AdminUsersHighlight[];
  approvals: AdminUsersHighlight[];
  recent: AdminUsersHighlight[];
  rows: AdminUsersRow[];
};

export type AdminUserRoleKey = 'admin' | 'trainer' | 'client' | 'unknown';

export type AdminUserStatusKey = 'active' | 'pending' | 'suspended' | 'disabled' | 'invited' | 'unknown';
