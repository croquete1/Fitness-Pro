import { getAdminApprovalsListFallback } from './admin-approvals';
import { buildAdminUsersDashboard } from '../users/dashboard';
import type { AdminApprovalListRow } from '@/lib/admin/approvals/types';
import type { AdminUserRecord, AdminUsersDashboardData } from '../users/types';

export type FallbackUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  approved: boolean;
  active: boolean;
  created_at: string | null;
  last_login_at: string | null;
  last_seen_at: string | null;
  online: boolean;
};

const EMPTY_USERS: FallbackUser[] = [];

export type SampleAdminDashboard = {
  totals: {
    users: number;
    clients: number;
    trainers: number;
    sessionsToday: number;
    pendingApprovals: number;
  };
  recentUsers: Array<{ id: string; name: string; email: string | null; createdAt: string | null }>;
  topTrainers: Array<{ id: string; name: string; total: number }>;
  agenda: Array<{
    id: string;
    scheduled_at: string | null;
    start_time?: string | null;
    trainer_id: string;
    trainer_name: string;
    client_id: string;
    client_name: string;
    location?: string | null;
  }>;
  topTrainersSource: 'materialized-view' | 'sessions-fallback' | 'sample';
  agendaSource: 'supabase' | 'sample';
};

export function getSampleAdminDashboard(): SampleAdminDashboard {
  return {
    totals: {
      users: 0,
      clients: 0,
      trainers: 0,
      sessionsToday: 0,
      pendingApprovals: 0,
    },
    recentUsers: [],
    topTrainers: [],
    agenda: [],
    topTrainersSource: 'sample',
    agendaSource: 'sample',
  };
}

export type SampleTrainerDashboard = {
  trainerId: string;
  clients: Array<{ id: string; name: string }>;
  stats: {
    totalClients: number;
    activePlans: number;
    sessionsThisWeek: number;
    pendingRequests: number;
  };
  upcoming: SampleAdminDashboard['agenda'];
};

export function getSampleTrainerDashboard(trainerId: string): SampleTrainerDashboard {
  return {
    trainerId,
    clients: [],
    stats: {
      totalClients: 0,
      activePlans: 0,
      sessionsThisWeek: 0,
      pendingRequests: 0,
    },
    upcoming: [],
  };
}

export type SampleQuery = {
  page: number;
  pageSize: number;
  search?: string;
  role?: string | null;
  status?: string | null;
};

export function getSampleUsers(_: SampleQuery) {
  return {
    rows: EMPTY_USERS,
    count: 0,
  };
}

export type SampleApprovalsQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string | null;
};

export function getSampleApprovals({
  page,
  pageSize,
  search,
  status,
}: SampleApprovalsQuery): {
  rows: AdminApprovalListRow[];
  count: number;
  source: 'fallback';
  generatedAt: string;
} {
  const { rows, count } = getAdminApprovalsListFallback({
    page,
    pageSize,
    search,
    status,
  });

  return {
    rows,
    count,
    source: 'fallback',
    generatedAt: new Date().toISOString(),
  };
}

export function getAdminUsersDashboardFallback(): AdminUsersDashboardData {
  const records: AdminUserRecord[] = EMPTY_USERS.map((row) => ({
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    approved: row.approved,
    active: row.active,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    lastSeenAt: row.last_seen_at,
    online: row.online,
  }));
  return buildAdminUsersDashboard(records, { supabase: false });
}
