import {
  buildAdminApprovalsDashboard,
  mapDashboardRowsToList,
  mapApprovalRow,
} from '@/lib/admin/approvals/dashboard';
import {
  type AdminApprovalListRow,
  type AdminApprovalRow,
  type AdminApprovalsDashboardData,
} from '@/lib/admin/approvals/types';

function isoHoursAgo(hours: number) {
  const date = new Date(Date.now() - hours * 3_600_000);
  return date.toISOString();
}

function isoDaysAgo(days: number, hours = 0) {
  const date = new Date(Date.now() - (days * 24 + hours) * 3_600_000);
  return date.toISOString();
}

const FALLBACK_ROWS: AdminApprovalRow[] = [
  {
    id: 'approval-pt-001',
    userId: 'client-luisa',
    name: 'Luísa Martins',
    email: 'luisa.martins@fitmail.pt',
    status: 'pending',
    requestedAt: isoHoursAgo(5),
    decidedAt: null,
    reviewerId: null,
    reviewerName: null,
    channel: 'app',
    metadata: { role: 'cliente', goal: 'recomposição corporal' },
  },
  {
    id: 'approval-pt-002',
    userId: 'trainer-eduardo',
    name: 'Eduardo Faria',
    email: 'eduardo.faria@hms.pt',
    status: 'pending',
    requestedAt: isoHoursAgo(18),
    decidedAt: null,
    reviewerId: null,
    reviewerName: null,
    channel: 'landing',
    metadata: { role: 'pt', speciality: 'força' },
  },
  {
    id: 'approval-pt-003',
    userId: 'trainer-juliana',
    name: 'Juliana Campos',
    email: 'juliana.campos@hms.pt',
    status: 'pending',
    requestedAt: isoHoursAgo(76),
    decidedAt: null,
    reviewerId: null,
    reviewerName: null,
    channel: 'referencia',
    metadata: { role: 'pt', speciality: 'hipertrofia' },
  },
  {
    id: 'approval-pt-004',
    userId: 'client-ines',
    name: 'Inês Barata',
    email: 'ines.barata@fitmail.pt',
    status: 'approved',
    requestedAt: isoHoursAgo(30),
    decidedAt: isoHoursAgo(8),
    reviewerId: 'adm-01',
    reviewerName: 'Sofia Ribeiro',
    channel: 'app',
    metadata: { role: 'cliente', goal: 'perda de peso' },
  },
  {
    id: 'approval-pt-005',
    userId: 'trainer-carlos',
    name: 'Carlos Abreu',
    email: 'carlos.abreu@hms.pt',
    status: 'approved',
    requestedAt: isoDaysAgo(2, 12),
    decidedAt: isoDaysAgo(2, 3),
    reviewerId: 'adm-02',
    reviewerName: 'Ricardo Gomes',
    channel: 'app',
    metadata: { role: 'pt', speciality: 'performance' },
  },
  {
    id: 'approval-pt-006',
    userId: 'trainer-joana',
    name: 'Joana Ferreira',
    email: 'joana.ferreira@hms.pt',
    status: 'approved',
    requestedAt: isoDaysAgo(4, 9),
    decidedAt: isoDaysAgo(3, 18),
    reviewerId: 'adm-01',
    reviewerName: 'Sofia Ribeiro',
    channel: 'landing',
    metadata: { role: 'pt', speciality: 'pilates' },
  },
  {
    id: 'approval-pt-007',
    userId: 'client-rafa',
    name: 'Rafael Sousa',
    email: 'rafael.sousa@fitmail.pt',
    status: 'rejected',
    requestedAt: isoDaysAgo(3, 4),
    decidedAt: isoDaysAgo(2, 22),
    reviewerId: 'adm-02',
    reviewerName: 'Ricardo Gomes',
    channel: 'app',
    metadata: { role: 'cliente', reason: 'dados incompletos' },
  },
  {
    id: 'approval-pt-008',
    userId: 'trainer-helena',
    name: 'Helena Braga',
    email: 'helena.braga@hms.pt',
    status: 'approved',
    requestedAt: isoDaysAgo(5, 6),
    decidedAt: isoDaysAgo(4, 12),
    reviewerId: 'adm-03',
    reviewerName: 'Manuel Tavares',
    channel: 'referencia',
    metadata: { role: 'pt', speciality: 'mobilidade' },
  },
  {
    id: 'approval-pt-009',
    userId: 'client-cristina',
    name: 'Cristina Moreira',
    email: 'cristina.moreira@fitmail.pt',
    status: 'approved',
    requestedAt: isoDaysAgo(1, 14),
    decidedAt: isoHoursAgo(12),
    reviewerId: 'adm-02',
    reviewerName: 'Ricardo Gomes',
    channel: 'app',
    metadata: { role: 'cliente', goal: 'condição física' },
  },
  {
    id: 'approval-pt-010',
    userId: 'trainer-nuno',
    name: 'Nuno Cardoso',
    email: 'nuno.cardoso@hms.pt',
    status: 'rejected',
    requestedAt: isoDaysAgo(6, 10),
    decidedAt: isoDaysAgo(5, 14),
    reviewerId: 'adm-01',
    reviewerName: 'Sofia Ribeiro',
    channel: 'landing',
    metadata: { role: 'pt', reason: 'certificação expirada' },
  },
  {
    id: 'approval-pt-011',
    userId: 'client-mariana',
    name: 'Mariana Lopes',
    email: 'mariana.lopes@fitmail.pt',
    status: 'approved',
    requestedAt: isoDaysAgo(7, 3),
    decidedAt: isoDaysAgo(6, 15),
    reviewerId: 'adm-03',
    reviewerName: 'Manuel Tavares',
    channel: 'app',
    metadata: { role: 'cliente', goal: 'corrida 10km' },
  },
  {
    id: 'approval-pt-012',
    userId: 'trainer-fabio',
    name: 'Fábio Nascimento',
    email: 'fabio.nascimento@hms.pt',
    status: 'approved',
    requestedAt: isoDaysAgo(8, 8),
    decidedAt: isoDaysAgo(7, 6),
    reviewerId: 'adm-02',
    reviewerName: 'Ricardo Gomes',
    channel: 'referencia',
    metadata: { role: 'pt', speciality: 'cross-training' },
  },
];

export function getAdminApprovalsFallbackRows(): AdminApprovalRow[] {
  return FALLBACK_ROWS.map((row) => ({ ...row }));
}

export function getAdminApprovalsDashboardFallback(): AdminApprovalsDashboardData {
  return buildAdminApprovalsDashboard(getAdminApprovalsFallbackRows(), {
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
  page,
  pageSize,
  search,
  status,
}: AdminApprovalsListFallbackQuery): { rows: AdminApprovalListRow[]; count: number } {
  const dataset = mapDashboardRowsToList(getAdminApprovalsFallbackRows());
  const normalizedSearch = search?.trim().toLowerCase();
  const normalizedStatus = status?.trim().toLowerCase();

  const filtered = dataset.filter((row) => {
    if (normalizedStatus && row.status !== normalizedStatus) return false;
    if (!normalizedSearch) return true;
    return [row.name, row.email, row.user_id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const start = Math.max(page, 0) * pageSize;
  const end = start + pageSize;
  return {
    rows: filtered.slice(start, end),
    count: filtered.length,
  };
}

export function getAdminApprovalsDatasetFallback(): AdminApprovalRow[] {
  return FALLBACK_ROWS.map((row) => ({ ...row }));
}

export function mapRawApprovalFallback(row: Record<string, any>): AdminApprovalRow {
  return mapApprovalRow(row);
}

