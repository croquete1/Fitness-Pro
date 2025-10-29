import { buildNotificationDashboardMetrics, describeType } from '@/lib/notifications/dashboard';
import type {
  NotificationDashboardData,
  NotificationRow,
  NotificationSnapshot,
} from '@/lib/notifications/types';

function addDays(base: Date, offset: number) {
  return new Date(base.getTime() + offset * 86_400_000);
}

function iso(date: Date) {
  return date.toISOString();
}

const now = new Date();
const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15, 0, 0);

const FALLBACK_ROWS: NotificationRow[] = [
  {
    id: 'ntf-8201',
    title: 'Renovação de plano confirmada',
    body: 'A mensalidade do cliente Luís Figueiredo foi cobrada com sucesso.',
    href: '/dashboard/clients/luis-figueiredo',
    read: true,
    type: 'billing',
    created_at: iso(addDays(base, -1)),
  },
  {
    id: 'ntf-8202',
    title: 'Sessão reprogramada para amanhã',
    body: 'Sara Costa aceitou remarcar a sessão com a cliente Sofia Almeida para amanhã às 08:30.',
    href: '/dashboard/sessions?session=sess-3012',
    read: false,
    type: 'session',
    created_at: iso(addDays(base, -2)),
  },
  {
    id: 'ntf-8203',
    title: 'Avaliação trimestral disponível',
    body: 'Os dados de composição corporal do cliente Tiago Cunha foram sincronizados.',
    href: '/dashboard/clients/tiago-cunha/metrics',
    read: true,
    type: 'insight',
    created_at: iso(addDays(base, -3)),
  },
  {
    id: 'ntf-8204',
    title: 'Campanha de retenção lançada',
    body: 'Campanha “Regresso aos treinos” activada para 146 clientes com risco de churn.',
    href: '/dashboard/reports/campaigns/regresso-aos-treinos',
    read: false,
    type: 'marketing',
    created_at: iso(addDays(base, -4)),
  },
  {
    id: 'ntf-8205',
    title: 'Nova avaliação de satisfação',
    body: 'O cliente João Martins atribuiu 5 estrelas à sessão de força funcional.',
    href: '/dashboard/reports/feedback',
    read: true,
    type: 'insight',
    created_at: iso(addDays(base, -5)),
  },
  {
    id: 'ntf-8206',
    title: 'Lembrete automático enviado',
    body: 'Foram enviados lembretes de presença para as sessões de amanhã (12 clientes).',
    href: '/dashboard/sessions/upcoming',
    read: true,
    type: 'reminder',
    created_at: iso(addDays(base, -6)),
  },
  {
    id: 'ntf-8207',
    title: 'Actualização de segurança concluída',
    body: 'O sistema aplicou o patch de segurança 2024.04.12 às 02:10 sem impacto.',
    href: '/dashboard/system/health',
    read: true,
    type: 'system',
    created_at: iso(addDays(base, -7)),
  },
  {
    id: 'ntf-8208',
    title: 'Falha de pagamento detectada',
    body: 'O cartão do cliente Maria Lopes expirou. A equipa deve reagendar a cobrança.',
    href: '/dashboard/billing/issues',
    read: false,
    type: 'billing',
    created_at: iso(addDays(base, -8)),
  },
  {
    id: 'ntf-8209',
    title: 'Novo pedido de inscrição',
    body: 'Pedro Nascimento submeteu formulário de onboarding via landing page PT Premium.',
    href: '/dashboard/admin/onboarding?prospect=pedro-nascimento',
    read: true,
    type: 'alert',
    created_at: iso(addDays(base, -9)),
  },
  {
    id: 'ntf-8210',
    title: 'Checklist diária concluída',
    body: 'A equipa de operações validou 34 pontos críticos antes da abertura.',
    href: '/dashboard/system/checklists',
    read: true,
    type: 'system',
    created_at: iso(addDays(base, -10)),
  },
  {
    id: 'ntf-8211',
    title: 'Lembrete pendente de leitura',
    body: 'Reforça com a cliente Catarina Silva a confirmação da sessão de sábado.',
    href: '/dashboard/clients/catarina-silva',
    read: false,
    type: 'reminder',
    created_at: iso(addDays(base, -11)),
  },
  {
    id: 'ntf-8212',
    title: 'Aviso de capacidade excedida',
    body: 'A aula de cycling das 19h excedeu 105% da capacidade planeada.',
    href: '/dashboard/reports/occupancy',
    read: true,
    type: 'alert',
    created_at: iso(addDays(base, -12)),
  },
  {
    id: 'ntf-8213',
    title: 'Nova mensagem do cliente',
    body: 'Inês Moreira partilhou feedback sobre a experiência com o PT João Martins.',
    href: '/dashboard/messages?thread=ines-moreira',
    read: true,
    type: 'session',
    created_at: iso(addDays(base, -13)),
  },
  {
    id: 'ntf-8214',
    title: 'Objectivos atingidos',
    body: 'O cliente Bruno Costa atingiu 10 semanas consecutivas dentro do plano alimentar.',
    href: '/dashboard/clients/bruno-costa/progress',
    read: true,
    type: 'insight',
    created_at: iso(addDays(base, -14)),
  },
];

function toSnapshot(rows: NotificationRow[]): NotificationSnapshot[] {
  return rows.map((row) => ({
    read: row.read,
    type: row.type ?? null,
    created_at: row.created_at ?? null,
  }));
}

export function getNotificationsDashboardFallback(): NotificationDashboardData {
  const snapshots = toSnapshot(FALLBACK_ROWS);
  const unread = FALLBACK_ROWS.filter((row) => !row.read).length;
  const metrics = buildNotificationDashboardMetrics(snapshots, {
    total: FALLBACK_ROWS.length,
    unread,
    lastDeliveryAt: FALLBACK_ROWS[0]?.created_at ?? null,
    supabase: false,
  });

  const initialRows = FALLBACK_ROWS.slice(0, 40).map((row) => ({
    ...row,
    type: describeType(row.type).key,
  }));

  return {
    initialRows,
    initialTotal: FALLBACK_ROWS.length,
    metrics,
  };
}

type ListFallbackParams = {
  status: 'all' | 'unread' | 'read';
  type?: string | null;
  search?: string | null;
  page: number;
  pageSize: number;
};

export function getNotificationsListFallback(params: ListFallbackParams) {
  const typeKey = params.type?.trim().toLowerCase();
  const search = params.search?.trim().toLowerCase();

  let dataset = FALLBACK_ROWS.slice();
  if (search) {
    dataset = dataset.filter((row) => {
      const haystack = `${row.title ?? ''} ${row.body ?? ''}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  const typeSummaryMap = new Map<string, { key: string; label: string; count: number }>();
  dataset.forEach((row) => {
    const meta = describeType(row.type);
    const current = typeSummaryMap.get(meta.key) ?? { key: meta.key, label: meta.label, count: 0 };
    current.count += 1;
    typeSummaryMap.set(meta.key, current);
  });

  if (typeKey && typeKey !== 'all') {
    dataset = dataset.filter((row) => describeType(row.type).key === typeKey);
  }

  const counts = {
    all: dataset.length,
    unread: dataset.filter((row) => !row.read).length,
    read: dataset.filter((row) => row.read).length,
  };

  let filtered = dataset;
  if (params.status === 'unread') {
    filtered = filtered.filter((row) => !row.read);
  }
  if (params.status === 'read') {
    filtered = filtered.filter((row) => row.read);
  }

  const total = filtered.length;
  const start = params.page * params.pageSize;
  const end = start + params.pageSize;

  return {
    items: filtered.slice(start, end).map((row) => ({
      ...row,
      type: describeType(row.type).key,
    })),
    total,
    counts,
    generatedAt: FALLBACK_ROWS[0]?.created_at ?? new Date().toISOString(),
    types: Array.from(typeSummaryMap.values())
      .sort((a, b) => {
        if (b.count === a.count) return a.label.localeCompare(b.label, 'pt-PT');
        return b.count - a.count;
      })
      .map((entry) => ({
        key: entry.key,
        label: entry.label,
        count: entry.count,
      })),
  };
}
