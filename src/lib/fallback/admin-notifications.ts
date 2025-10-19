import {
  buildAdminNotificationsDashboard,
  mapNotificationRow,
  mapNotificationsToList,
} from '@/lib/admin/notifications/dashboard';
import {
  type AdminNotificationListRow,
  type AdminNotificationRow,
  type AdminNotificationsDashboardData,
} from '@/lib/admin/notifications/types';

function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function isoDaysAgo(days: number, hours = 0) {
  return new Date(Date.now() - (days * 24 + hours) * 3_600_000).toISOString();
}

const FALLBACK_ROWS: AdminNotificationRow[] = [
  {
    id: 'notif-001',
    userId: 'client-luisa',
    title: 'Resumo semanal concluído',
    body: 'As tuas métricas de treino já estão disponíveis no painel.',
    type: 'Resumo',
    channel: 'Email',
    audience: 'Clientes activos',
    read: true,
    createdAt: isoHoursAgo(5),
    sentAt: isoHoursAgo(5),
    metadata: { segment: 'clientes' },
  },
  {
    id: 'notif-002',
    userId: 'trainer-eduardo',
    title: 'Novo pedido de cliente',
    body: 'A cliente Ana Silva solicitou atribuição para o teu roster.',
    type: 'Alerta',
    channel: 'App',
    audience: 'Treinadores',
    read: false,
    createdAt: isoHoursAgo(12),
    sentAt: isoHoursAgo(12),
    metadata: { priority: 'alta' },
  },
  {
    id: 'notif-003',
    userId: 'trainer-juliana',
    title: 'Campanha Novembro em forma',
    body: 'Convida os teus clientes a aderir ao programa de Novembro.',
    type: 'Campanha',
    channel: 'Email',
    audience: 'Treinadores activos',
    read: true,
    createdAt: isoDaysAgo(1, 4),
    sentAt: isoDaysAgo(1, 4),
    metadata: { clickRate: 0.42 },
  },
  {
    id: 'notif-004',
    userId: 'client-ines',
    title: 'Fatura disponível',
    body: 'A fatura do plano mensal já pode ser descarregada.',
    type: 'Financeiro',
    channel: 'Email',
    audience: 'Clientes premium',
    read: false,
    createdAt: isoHoursAgo(54),
    sentAt: isoHoursAgo(54),
    metadata: { invoice: 'INV-2023-11-002' },
  },
  {
    id: 'notif-005',
    userId: 'client-rafa',
    title: 'Sessão relembrada',
    body: 'Não te esqueças da sessão com o PT João amanhã às 09h.',
    type: 'Lembrete',
    channel: 'Push',
    audience: 'Clientes agendados',
    read: true,
    createdAt: isoDaysAgo(2, 6),
    sentAt: isoDaysAgo(2, 6),
    metadata: { sessionId: 'sess-445' },
  },
  {
    id: 'notif-006',
    userId: 'trainer-helena',
    title: 'Feedback pendente',
    body: 'Tens 3 avaliações de clientes por concluir esta semana.',
    type: 'Alerta',
    channel: 'App',
    audience: 'Treinadores',
    read: false,
    createdAt: isoHoursAgo(72),
    sentAt: isoHoursAgo(72),
    metadata: { pending: 3 },
  },
  {
    id: 'notif-007',
    userId: 'client-cristina',
    title: 'Plano actualizado',
    body: 'O teu treinador ajustou o plano com novos exercícios.',
    type: 'Resumo',
    channel: 'App',
    audience: 'Clientes activos',
    read: true,
    createdAt: isoDaysAgo(3, 3),
    sentAt: isoDaysAgo(3, 3),
    metadata: { planId: 'plan-elite' },
  },
  {
    id: 'notif-008',
    userId: 'client-mariana',
    title: 'Promoção Black Friday',
    body: 'Aproveita 20% desconto em pacotes de PT até sexta-feira.',
    type: 'Campanha',
    channel: 'Email',
    audience: 'Clientes inactivos',
    read: false,
    createdAt: isoDaysAgo(0, 22),
    sentAt: isoDaysAgo(0, 22),
    metadata: { discount: 0.2 },
  },
  {
    id: 'notif-009',
    userId: 'trainer-nuno',
    title: 'Checklist de onboarding',
    body: 'Completa a checklist para activares a agenda pública.',
    type: 'Onboarding',
    channel: 'App',
    audience: 'Treinadores novos',
    read: true,
    createdAt: isoDaysAgo(4, 5),
    sentAt: isoDaysAgo(4, 5),
    metadata: { steps: 5 },
  },
  {
    id: 'notif-010',
    userId: 'client-filipe',
    title: 'Recuperação agendada',
    body: 'Temos uma sugestão de sessão de mobilidade para domingo.',
    type: 'Sugestão',
    channel: 'Push',
    audience: 'Clientes activos',
    read: false,
    createdAt: isoDaysAgo(1, 18),
    sentAt: isoDaysAgo(1, 18),
    metadata: { category: 'mobilidade' },
  },
];

export function getAdminNotificationsFallbackRows(): AdminNotificationRow[] {
  return FALLBACK_ROWS.map((row) => ({ ...row }));
}

export function getAdminNotificationsDashboardFallback(): AdminNotificationsDashboardData {
  return buildAdminNotificationsDashboard(getAdminNotificationsFallbackRows(), {
    source: 'fallback',
    supabaseConfigured: false,
  });
}

export type AdminNotificationsListFallbackQuery = {
  page: number;
  pageSize: number;
  search?: string | null;
  type?: string | null;
  unread?: boolean | null;
};

export function getAdminNotificationsListFallback({
  page,
  pageSize,
  search,
  type,
  unread,
}: AdminNotificationsListFallbackQuery): { rows: AdminNotificationListRow[]; count: number } {
  const dataset = mapNotificationsToList(getAdminNotificationsFallbackRows());
  const normalizedSearch = search?.trim().toLowerCase();
  const normalizedType = type?.trim().toLowerCase();
  const filtered = dataset.filter((row) => {
    if (unread === true && row.read) return false;
    if (unread === false && !row.read) return false;
    if (normalizedType && (row.type ?? '').toLowerCase() !== normalizedType) return false;
    if (!normalizedSearch) return true;
    return [row.title, row.body, row.user_id]
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

export function mapRawNotificationFallback(row: Record<string, any>): AdminNotificationRow {
  return mapNotificationRow(row);
}

