export type FallbackNotification = {
  id: string;
  title: string;
  body?: string | null;
  href?: string | null;
  minutesAgo: number;
};

type BuildOptions = {
  limit?: number;
  now?: Date;
};

const FALLBACK_NOTIFICATIONS: FallbackNotification[] = [
  {
    id: 'fallback-notif-001',
    title: 'Check-in concluído por Sofia Martins',
    body: 'Acompanhamento de massa magra actualizado pelo PT Ricardo Duarte.',
    href: '/dashboard/clients/sofia-martins',
    minutesAgo: 38,
  },
  {
    id: 'fallback-notif-002',
    title: 'Novo comentário na sessão de amanhã',
    body: 'O cliente João Costa deixou uma nota sobre a mobilidade do tornozelo.',
    href: '/dashboard/sessions/8f4c21da',
    minutesAgo: 86,
  },
  {
    id: 'fallback-notif-003',
    title: 'Plano "Reforço Pós-Lesion" actualizado',
    body: 'A PT Ana Ribeiro adicionou variações de agachamento com kettlebell.',
    href: '/dashboard/pt/plans/plan-24-out-ana',
    minutesAgo: 142,
  },
  {
    id: 'fallback-notif-004',
    title: 'Pagamento confirmado',
    body: 'A factura #2024-118 foi liquidada via MBWay pelo cliente Inês Almeida.',
    href: '/dashboard/billing/invoices/2024-118',
    minutesAgo: 213,
  },
  {
    id: 'fallback-notif-005',
    title: 'Sessão reagendada',
    body: 'Miguel Ferreira transferiu a sessão de força para sexta-feira às 07:30.',
    href: '/dashboard/pt/reschedules',
    minutesAgo: 327,
  },
  {
    id: 'fallback-notif-006',
    title: 'Alertas de recuperação',
    body: 'Duas medições de HRV abaixo do normal para Catarina Lopes nas últimas 24h.',
    href: '/dashboard/client/recuperacao/catarina-lopes',
    minutesAgo: 511,
  },
];

export function buildFallbackHeaderNotifications({ limit = 6, now = new Date() }: BuildOptions = {}) {
  const base = new Date(now);
  const items = FALLBACK_NOTIFICATIONS.slice(0, limit).map((item) => {
    const created = new Date(base.getTime() - item.minutesAgo * 60_000);
    return {
      id: item.id,
      title: item.title,
      body: item.body ?? null,
      href: item.href ?? null,
      createdAt: created.toISOString(),
      read: false,
    };
  });

  return {
    items,
    generatedAt: items[0]?.createdAt ?? base.toISOString(),
    unreadCount: items.filter((item) => !item.read).length,
  };
}
