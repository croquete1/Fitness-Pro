import { buildAdminApprovalsDashboard } from '@/lib/admin/approvals/dashboard';
import {
  type AdminApprovalListRow,
  type AdminApprovalRow,
  type AdminApprovalsDashboardData,
} from '@/lib/admin/approvals/types';

const EMPTY_ROWS: AdminApprovalRow[] = [];

export function getAdminApprovalsFallbackRows(): AdminApprovalRow[] {
  return EMPTY_ROWS;
}

export function getAdminApprovalsDashboardFallback(): AdminApprovalsDashboardData {
  return buildAdminApprovalsDashboard([], {
    source: 'fallback',
    supabaseConfigured: false,
  });
}

export type AdminApprovalsListFallbackQuery = {
  page: number;
  pageSize: number;
  search?: string | null;
  status?: string | null;
};

export function getAdminApprovalsListFallback({
  page: _page,
  pageSize: _pageSize,
}: AdminApprovalsListFallbackQuery): { rows: AdminApprovalListRow[]; count: number } {
  return {
    rows: [],
    count: 0,
  };
}

export function getAdminApprovalsDatasetFallback(): AdminApprovalRow[] {
  return EMPTY_ROWS;
}


