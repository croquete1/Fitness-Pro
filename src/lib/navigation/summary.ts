import {
  type NavigationHighlight,
  type NavigationQuickMetric,
  type NavigationSummary,
  type NavigationSummaryGroup,
  type NavigationSummaryInput,
  type NavigationSummaryCounts,
} from './types';

const integerFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function formatInteger(value?: number | null): string {
  if (!Number.isFinite(value ?? null)) return '0';
  return integerFormatter.format(Math.round(value ?? 0));
}

function formatCurrency(value?: number | null): string {
  if (!Number.isFinite(value ?? null)) return '—';
  return currencyFormatter.format(value ?? 0);
}

function formatCurrencyDelta(value?: number | null): string | null {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric === 0) return null;
  const formatted = currencyFormatter.format(Math.abs(numeric));
  return numeric > 0 ? `+${formatted}` : `-${formatted}`;
}

function formatScore(value?: number | null): string {
  if (!Number.isFinite(value ?? null)) return '—';
  return decimalFormatter.format(value ?? 0);
}

function formatRelativeDate(value?: string | null, now?: Date): string | null {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const base = now ?? new Date();
  const diff = target.getTime() - base.getTime();
  const abs = Math.abs(diff);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
    { limit: 604_800_000, unit: 'day', size: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
    { limit: Infinity, unit: 'year', size: 31_556_952_000 },
  ];
  const bucket = thresholds.find((item) => abs < item.limit) ?? thresholds[thresholds.length - 1]!;
  const valueRounded = Math.round(diff / bucket.size);
  return relativeFormatter.format(valueRounded, bucket.unit);
}

function buildQuickMetrics(
  role: NavigationSummaryInput['role'],
  counts: NavigationSummaryCounts,
  now: Date,
): NavigationQuickMetric[] {
  if (role === 'ADMIN') {
    return [
      {
        id: 'approvals',
        label: 'Aprovações pendentes',
        value: formatInteger(counts.approvalsPending ?? 0),
        tone: (counts.approvalsPending ?? 0) > 0 ? 'warning' : 'positive',
        hint: 'Pedidos que aguardam revisão',
        href: '/dashboard/admin/approvals',
      },
      {
        id: 'active-clients',
        label: 'Clientes activos',
        value: formatInteger(counts.clientsActive ?? 0),
        tone: 'primary',
        hint: 'Perfis com planos em curso',
        href: '/dashboard/admin/users',
      },
      {
        id: 'revenue-month',
        label: 'Receita do mês',
        value: formatCurrency(counts.revenueMonth ?? 0),
        tone: 'positive',
        hint: 'Faturado em facturas marcadas como pagas',
        href: '/dashboard/billing',
      },
      {
        id: 'catalog-global',
        label: 'Catálogo global',
        value: formatInteger(counts.libraryCatalog ?? 0),
        tone: (counts.libraryCatalog ?? 0) >= 40 ? 'positive' : 'primary',
        hint: 'Exercícios publicados disponíveis para toda a equipa',
        href: '/dashboard/admin/catalog',
      },
      {
        id: 'alerts',
        label: 'Alertas abertos',
        value: formatInteger(counts.notificationsUnread ?? 0),
        tone: (counts.notificationsUnread ?? 0) > 0 ? 'warning' : 'neutral',
        hint: 'Notificações por ler',
        href: '/dashboard/notifications',
      },
    ];
  }

  if (role === 'TRAINER') {
    return [
      {
        id: 'sessions-today',
        label: 'Sessões hoje',
        value: formatInteger(counts.sessionsToday ?? counts.sessionsUpcoming ?? 0),
        tone: (counts.sessionsToday ?? 0) >= 4 ? 'warning' : 'primary',
        hint: 'Sessões agendadas para as próximas horas',
        href: '/dashboard/pt/workouts',
      },
      {
        id: 'plans-active',
        label: 'Planos activos',
        value: formatInteger(counts.plansActive ?? 0),
        tone: 'positive',
        hint: 'Planos com sessões em execução',
        href: '/dashboard/pt/plans',
      },
      {
        id: 'library-personal',
        label: 'Exercícios pessoais',
        value: formatInteger(counts.libraryPersonal ?? 0),
        tone: (counts.libraryPersonal ?? 0) >= 25 ? 'positive' : 'primary',
        hint:
          counts.libraryUpdatedAt
            ? `Actualizado ${formatRelativeDate(counts.libraryUpdatedAt, now) ?? 'recentemente'}`
            : 'Disponíveis para usar nos planos',
        href: '/dashboard/pt/library',
      },
      {
        id: 'messages-unread',
        label: 'Mensagens por responder',
        value: formatInteger(counts.messagesUnread ?? 0),
        tone: (counts.messagesUnread ?? 0) > 0 ? 'warning' : 'neutral',
        hint: 'Novos contactos dos clientes',
        href: '/dashboard/messages',
      },
    ];
  }

  const walletMetric = {
    id: 'wallet-balance',
    label: 'Saldo carteira',
    value: formatCurrency(counts.walletBalance ?? 0),
    tone: (counts.walletBalance ?? 0) > 0 ? 'positive' : 'neutral',
    hint:
      counts.walletUpdatedAt
        ? `Actualizado ${formatRelativeDate(counts.walletUpdatedAt, now) ?? 'recentemente'}`
        : 'Sem movimentos recentes',
    href: '/dashboard/clients/wallet',
    delta: counts.walletNet30d ?? null,
    deltaLabel: formatCurrencyDelta(counts.walletNet30d),
  } satisfies NavigationQuickMetric;

  return [
    walletMetric,
    {
      id: 'upcoming-sessions',
      label: 'Próximas sessões',
      value: formatInteger(counts.sessionsUpcoming ?? 0),
      tone: (counts.sessionsUpcoming ?? 0) > 0 ? 'primary' : 'neutral',
      hint: 'Sessões marcadas para esta semana',
      href: '/dashboard/sessions',
    },
    {
      id: 'active-plans',
      label: 'Planos activos',
      value: formatInteger(counts.plansActive ?? 0),
      tone: 'primary',
      hint: 'Planos actualmente em execução',
      href: '/dashboard/my-plan',
    },
    {
      id: 'notifications',
      label: 'Notificações novas',
      value: formatInteger(counts.notificationsUnread ?? 0),
      tone: (counts.notificationsUnread ?? 0) > 0 ? 'warning' : 'neutral',
      hint: 'Alertas e lembretes recentes',
      href: '/dashboard/notifications',
    },
    {
      id: 'payments',
      label: 'Pagamentos pendentes',
      value: formatInteger(counts.invoicesPending ?? 0),
      tone: (counts.invoicesPending ?? 0) > 0 ? 'warning' : 'positive',
      hint: 'Facturas ainda por liquidar',
      href: '/dashboard/billing',
    },
  ];
}

function buildHighlights(
  role: NavigationSummaryInput['role'],
  counts: NavigationSummaryCounts,
  now: Date,
): NavigationHighlight[] {
  if (role === 'ADMIN') {
    return [
      {
        id: 'onboarding',
        title: 'Fluxo de onboarding',
        description: `${formatInteger(counts.onboardingPending ?? 0)} registos aguardam aprovação.`,
        href: '/dashboard/admin/onboarding',
        icon: 'check-circle',
        tone: (counts.onboardingPending ?? 0) > 0 ? 'warning' : 'positive',
      },
      {
        id: 'revenue-pending',
        title: 'Cobranças por fechar',
        description: `${formatCurrency(counts.revenuePending ?? 0)} pendentes na faturação.`,
        href: '/dashboard/billing',
        icon: 'plans',
        tone: (counts.revenuePending ?? 0) > 0 ? 'warning' : 'neutral',
      },
      {
        id: 'catalog-health',
        title: 'Catálogo global',
        description: `${formatInteger(counts.libraryCatalog ?? 0)} exercícios prontos para os treinadores.`,
        href: '/dashboard/admin/catalog',
        icon: 'library',
        tone: (counts.libraryCatalog ?? 0) > 0 ? 'primary' : 'warning',
      },
    ];
  }

  if (role === 'TRAINER') {
    return [
      {
        id: 'clients-active',
        title: 'Clientes activos',
        description: `${formatInteger(counts.clientsActive ?? 0)} clientes com acompanhamento esta semana.`,
        href: '/dashboard/pt/clients',
        icon: 'users',
        tone: 'primary',
      },
      {
        id: 'sessions-upcoming',
        title: 'Próximas sessões',
        description: `${formatInteger(counts.sessionsUpcoming ?? 0)} sessões agendadas nos próximos dias.`,
        href: '/dashboard/pt/workouts',
        icon: 'calendar',
        tone: 'neutral',
      },
      {
        id: 'library-catalog',
        title: 'Catálogo global',
        description: `${formatInteger(counts.libraryCatalog ?? 0)} exercícios prontos a duplicar.`,
        href: '/dashboard/pt/library?scope=global',
        icon: 'library',
        tone: 'neutral',
      },
    ];
  }

  const walletBalance = counts.walletBalance ?? 0;
  const walletNet = counts.walletNet30d ?? 0;
  const walletTone = walletNet < 0 ? 'warning' : walletNet > 0 ? 'positive' : 'neutral';
  const walletDescription = walletNet
    ? `${formatCurrency(walletBalance)} disponíveis. ${
        walletNet > 0 ? 'Reforço de' : 'Utilização de'
      } ${formatCurrency(Math.abs(walletNet))} nas últimas 4 semanas.`
    : `${formatCurrency(walletBalance)} disponíveis sem variação nas últimas 4 semanas.`;

  return [
    {
      id: 'wallet',
      title: 'Carteira',
      description: walletDescription,
      href: '/dashboard/clients/wallet',
      icon: 'wallet',
      tone: walletTone,
    },
    {
      id: 'sessions-today',
      title: 'Hoje',
      description: `${formatInteger(counts.sessionsToday ?? 0)} sessões previstas para hoje.`,
      href: '/dashboard/sessions',
      icon: 'calendar',
      tone: 'primary',
    },
    {
      id: 'invoices',
      title: 'Pagamentos',
      description: `${formatInteger(counts.invoicesPending ?? 0)} pagamentos aguardam confirmação.`,
      href: '/dashboard/billing',
      icon: 'plans',
      tone: (counts.invoicesPending ?? 0) > 0 ? 'warning' : 'positive',
    },
  ];
}

function buildGroups(role: NavigationSummaryInput['role'], counts: NavigationSummaryCounts): NavigationSummaryGroup[] {
  if (role === 'ADMIN') {
    const approvals = counts.approvalsPending ?? 0;
    const notifications = counts.notificationsUnread ?? 0;
    return [
      {
        id: 'admin',
        title: 'Administração',
        items: [
          {
            id: 'admin-dashboard',
            label: 'Painel',
            href: '/dashboard/admin',
            icon: 'dashboard',
            description: 'Resumo executivo com métricas em tempo real.',
          },
          {
            id: 'admin-approvals',
            label: 'Aprovações',
            href: '/dashboard/admin/approvals',
            icon: 'check-circle',
            description: 'Valida pedidos de acesso e alterações de perfil.',
            badge: approvals,
            tone: approvals > 0 ? 'warning' : 'neutral',
          },
          {
            id: 'admin-users',
            label: 'Utilizadores',
            href: '/dashboard/admin/users',
            icon: 'users',
            description: 'Gestão de equipas, perfis e permissões.',
            kpiLabel: 'Activos',
            kpiValue: formatInteger((counts.clientsActive ?? 0) + (counts.trainersActive ?? 0)),
          },
        ],
      },
      {
        id: 'management',
        title: 'Gestão',
        items: [
          {
            id: 'admin-exercises',
            label: 'Biblioteca',
            href: '/dashboard/admin/exercises',
            icon: 'library',
            description: 'Exercícios validados e playlists operacionais.',
          },
          {
            id: 'admin-plans',
            label: 'Planos',
            href: '/dashboard/admin/plans',
            icon: 'plans',
            description: 'Catálogo de planos corporativos e PTs.',
            kpiLabel: 'Activos',
            kpiValue: formatInteger(counts.plansActive ?? 0),
          },
          {
            id: 'admin-pts-schedule',
            label: 'Agenda PTs',
            href: '/dashboard/admin/pts-schedule',
            icon: 'calendar',
            description: 'Visão consolidada das sessões de personal trainers.',
            kpiLabel: 'Hoje',
            kpiValue: formatInteger(counts.sessionsToday ?? 0),
          },
        ],
      },
      {
        id: 'system',
        title: 'Sistema',
        items: [
          {
            id: 'system-control',
            label: 'Centro de controlo',
            href: '/dashboard/system',
            icon: 'system',
            description: 'Estado do ecossistema e dependências críticas.',
          },
          {
            id: 'system-metrics',
            label: 'Métricas',
            href: '/dashboard/system/metrics',
            icon: 'metrics',
            description: 'Indicadores globais de utilização e performance.',
          },
          {
            id: 'system-logs',
            label: 'Logs e auditoria',
            href: '/dashboard/system/logs',
            icon: 'terminal',
            description: 'Trilhas de auditoria, autenticação e acesso.',
          },
        ],
      },
      {
        id: 'settings',
        title: 'Definições',
        items: [
          {
            id: 'admin-notifications',
            label: 'Notificações',
            href: '/dashboard/admin/notifications',
            icon: 'notifications',
            description: 'Campanhas e alertas operacionais.',
            badge: notifications,
            tone: notifications > 0 ? 'warning' : 'neutral',
          },
          {
            id: 'settings-dashboard',
            label: 'Definições',
            href: '/dashboard/settings',
            icon: 'settings',
            description: 'Preferências da conta e integrações.',
          },
        ],
      },
    ];
  }

  if (role === 'TRAINER') {
    const notifications = counts.notificationsUnread ?? 0;
    const messages = counts.messagesUnread ?? 0;
    return [
      {
        id: 'overview',
        title: 'Overview',
        items: [
          {
            id: 'trainer-dashboard',
            label: 'Painel',
            href: '/dashboard/pt',
            icon: 'dashboard',
            description: 'Resumo das métricas de treino e highlights diários.',
          },
          {
            id: 'trainer-workouts',
            label: 'Sessões',
            href: '/dashboard/pt/workouts',
            icon: 'calendar',
            description: 'Agenda de treinos com presença confirmada.',
            kpiLabel: 'Hoje',
            kpiValue: formatInteger(counts.sessionsToday ?? 0),
          },
          {
            id: 'trainer-plans',
            label: 'Planos',
            href: '/dashboard/pt/plans',
            icon: 'plans',
            description: 'Planos activos e estado de execução.',
            kpiLabel: 'Activos',
            kpiValue: formatInteger(counts.plansActive ?? 0),
          },
        ],
      },
      {
        id: 'clients',
        title: 'Clientes',
        items: [
          {
            id: 'trainer-clients',
            label: 'Os meus clientes',
            href: '/dashboard/pt/clients',
            icon: 'users',
            description: 'Contactos, planos e progresso individual.',
            kpiLabel: 'Activos',
            kpiValue: formatInteger(counts.clientsActive ?? 0),
          },
          {
            id: 'trainer-messages',
            label: 'Mensagens',
            href: '/dashboard/messages',
            icon: 'messages',
            description: 'Comunicação directa com os clientes.',
            badge: messages,
            tone: messages > 0 ? 'warning' : 'neutral',
          },
        ],
      },
      {
        id: 'library',
        title: 'Biblioteca',
        items: [
          {
            id: 'trainer-exercises',
            label: 'Exercícios',
            href: '/dashboard/pt/library',
            icon: 'library',
            description: 'Colecção personalizada de exercícios PT.',
            kpiLabel: 'Pessoais',
            kpiValue: formatInteger(counts.libraryPersonal ?? 0),
          },
          {
            id: 'trainer-history',
            label: 'Histórico',
            href: '/dashboard/history',
            icon: 'history',
            description: 'Sessões passadas e registos de avaliação.',
          },
        ],
      },
      {
        id: 'account',
        title: 'Conta',
        items: [
          {
            id: 'trainer-notifications',
            label: 'Notificações',
            href: '/dashboard/notifications',
            icon: 'notifications',
            description: 'Alertas de clientes e do sistema.',
            badge: notifications,
            tone: notifications > 0 ? 'warning' : 'neutral',
          },
          {
            id: 'trainer-settings',
            label: 'Definições',
            href: '/dashboard/settings',
            icon: 'settings',
            description: 'Preferências pessoais e disponibilidade.',
          },
        ],
      },
    ];
  }

  const notifications = counts.notificationsUnread ?? 0;
  const messages = counts.messagesUnread ?? 0;
  return [
    {
      id: 'overview',
      title: 'Painel',
      items: [
        {
          id: 'client-dashboard',
          label: 'Painel',
          href: '/dashboard/clients',
          icon: 'dashboard',
          description: 'Resumo do progresso e KPIs pessoais.',
        },
        {
          id: 'client-my-plan',
          label: 'Os meus planos',
          href: '/dashboard/my-plan',
          icon: 'plans',
          description: 'Planos activos e próximos marcos.',
          kpiLabel: 'Activos',
          kpiValue: formatInteger(counts.plansActive ?? 0),
        },
        {
          id: 'client-sessions',
          label: 'Sessões',
          href: '/dashboard/sessions',
          icon: 'calendar',
          description: 'Agenda de treinos e confirmações de presença.',
          badge: counts.sessionsUpcoming ?? 0,
        },
      ],
    },
    {
      id: 'communication',
      title: 'Comunicação',
      items: [
        {
          id: 'client-messages',
          label: 'Mensagens',
          href: '/dashboard/messages',
          icon: 'messages',
          description: 'Conversa directa com o treinador.',
          badge: messages,
          tone: messages > 0 ? 'warning' : 'neutral',
        },
        {
          id: 'client-notifications',
          label: 'Notificações',
          href: '/dashboard/notifications',
          icon: 'notifications',
          description: 'Alertas do sistema e lembretes.',
          badge: notifications,
          tone: notifications > 0 ? 'warning' : 'neutral',
        },
      ],
    },
    {
      id: 'support',
      title: 'Conta',
      items: [
        {
          id: 'client-history',
          label: 'Histórico',
          href: '/dashboard/history',
          icon: 'history',
          description: 'Linhas cronológicas de sessões e medições.',
        },
        {
          id: 'client-profile',
          label: 'Perfil',
          href: '/dashboard/profile',
          icon: 'profile',
          description: 'Dados pessoais e preferências.',
        },
        {
          id: 'client-settings',
          label: 'Definições',
          href: '/dashboard/settings',
          icon: 'settings',
          description: 'Notificações, privacidade e integrações.',
        },
      ],
    },
  ];
}

export function buildNavigationSummary(input: NavigationSummaryInput): NavigationSummary {
  const now = input.now ?? new Date();
  const quickMetrics = buildQuickMetrics(input.role, input.counts, now);
  const highlights = buildHighlights(input.role, input.counts, now);
  const navGroups = buildGroups(input.role, input.counts);

  return {
    role: input.role,
    updatedAt: now.toISOString(),
    quickMetrics,
    highlights,
    navGroups,
  };
}
