'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { SidebarNavSection, type SidebarNavItem } from '@/components/layout/SidebarNav';
import SidebarHighlights from '@/components/layout/SidebarHighlights';
import SidebarQuickMetrics from '@/components/layout/SidebarQuickMetrics';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import type { ClientCounts } from '@/lib/hooks/useCounts';
import type {
  NavigationHighlight,
  NavigationSummary,
  NavigationSummaryGroup,
} from '@/lib/navigation/types';

type Props = {
  initialCounts?: ClientCounts;
  summary?: NavigationSummary | null;
  loading?: boolean;
  onRefreshNavigation?: () => Promise<unknown> | unknown;
};

const FALLBACK_GROUPS = (counts?: ClientCounts): { title: string; items: SidebarNavItem[] }[] => {
  const messages = counts?.messagesCount ?? 0;
  const notifications = counts?.notificationsCount ?? 0;
  return [
    {
      title: 'Painel',
      items: [
        {
          href: '/dashboard/clients',
          label: 'Painel',
          icon: 'dashboard',
          exact: true,
          activePrefix: '/dashboard/clients',
          description: 'Resumo do progresso e objectivos activos.',
        },
        {
          href: '/dashboard/my-plan',
          label: 'Os meus planos',
          icon: 'plans',
          activePrefix: '/dashboard/my-plan',
          description: 'Planos activos, tarefas e próximos marcos.',
        },
        {
          href: '/dashboard/sessions',
          label: 'Sessões',
          icon: 'calendar',
          activePrefix: '/dashboard/sessions',
          description: 'Agenda de treinos e confirmações de presença.',
        },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        {
          href: '/dashboard/messages',
          label: 'Mensagens',
          icon: 'messages',
          activePrefix: '/dashboard/messages',
          badge: messages || null,
          tone: messages > 0 ? 'warning' : undefined,
          description: 'Conversa directa com o treinador.',
        },
        {
          href: '/dashboard/notifications',
          label: 'Notificações',
          icon: 'notifications',
          activePrefix: '/dashboard/notifications',
          badge: notifications || null,
          tone: notifications > 0 ? 'warning' : undefined,
          description: 'Alertas, lembretes e actualizações.',
        },
      ],
    },
    {
      title: 'Conta',
      items: [
        {
          href: '/dashboard/history',
          label: 'Histórico',
          icon: 'history',
          activePrefix: '/dashboard/history',
          description: 'Registos de sessões e estatísticas.',
        },
        {
          href: '/dashboard/profile',
          label: 'Perfil',
          icon: 'profile',
          activePrefix: '/dashboard/profile',
          description: 'Dados pessoais e preferências.',
        },
        {
          href: '/dashboard/settings',
          label: 'Definições',
          icon: 'settings',
          activePrefix: '/dashboard/settings',
          description: 'Notificações, privacidade e integrações.',
        },
      ],
    },
  ];
};

const describeMessages = (pending: number) => {
  if (pending <= 0) return 'Tudo em dia nas mensagens.';
  return `${pending} ${pending === 1 ? 'conversa aguarda' : 'conversas aguardam'} resposta.`;
};

const describeNotifications = (pending: number) => {
  if (pending <= 0) return 'Sem novos alertas.';
  return `${pending} ${pending === 1 ? 'alerta recente' : 'alertas recentes'} para rever.`;
};

const FALLBACK_HIGHLIGHTS = (counts?: ClientCounts): NavigationHighlight[] => {
  const messages = counts?.messagesCount ?? 0;
  const notifications = counts?.notificationsCount ?? 0;

  return [
    {
      id: 'sessions-focus',
      title: 'Confirmar presença',
      description: 'Revê a agenda da semana e confirma as sessões.',
      href: '/dashboard/sessions',
      icon: 'calendar',
      tone: 'primary',
    },
    {
      id: 'messages-focus',
      title: 'Mensagens por ler',
      description: describeMessages(messages),
      href: '/dashboard/messages',
      icon: 'messages',
      tone: messages > 0 ? 'warning' : undefined,
    },
    {
      id: 'notifications-focus',
      title: 'Alertas recentes',
      description: describeNotifications(notifications),
      href: '/dashboard/notifications',
      icon: 'notifications',
      tone: notifications > 0 ? 'warning' : undefined,
    },
  ];
};

function mapGroup(group: NavigationSummaryGroup): { title: string; items: SidebarNavItem[] } {
  return {
    title: group.title,
    items: group.items.map((item) => ({
      href: item.href,
      label: item.label,
      icon: item.icon,
      badge: item.badge ?? null,
      description: item.description ?? null,
      kpiLabel: item.kpiLabel ?? null,
      kpiValue: item.kpiValue ?? null,
      tone: item.tone ?? undefined,
      activePrefix: item.activePrefix ?? undefined,
      exact: Boolean(item.exact),
    })),
  };
}

export default function SidebarClient({ initialCounts, summary, loading, onRefreshNavigation }: Props) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile } = useSidebar();
  const isRail = !isMobile && collapsed && !peek;

  const handleNavigate = React.useCallback(() => {
    if (isMobile) closeMobile();
  }, [closeMobile, isMobile]);

  const groups = React.useMemo(() => {
    if (summary?.navGroups?.length) {
      return summary.navGroups.map(mapGroup);
    }
    return FALLBACK_GROUPS(initialCounts);
  }, [summary, initialCounts]);

  const quickMetrics = React.useMemo(() => summary?.quickMetrics ?? [], [summary]);
  const highlights = React.useMemo(
    () => summary?.highlights ?? FALLBACK_HIGHLIGHTS(initialCounts),
    [summary, initialCounts],
  );
  const dataSource: 'supabase' | 'fallback' | undefined = summary
    ? 'supabase'
    : initialCounts
    ? 'fallback'
    : undefined;
  const generatedAt = summary?.updatedAt ?? null;

  const header = (
    <div className="neo-sidebar__headline">
      <div className="neo-sidebar__headline-meta">
        <span className="neo-sidebar__headline-label">Acesso rápido</span>
        {dataSource && (
          <DataSourceBadge
            source={dataSource}
            generatedAt={generatedAt}
            className="neo-sidebar__headline-badge"
          />
        )}
      </div>
      {onRefreshNavigation && (
        <button
          type="button"
          className="neo-sidebar__headline-action"
          onClick={() => onRefreshNavigation()}
          aria-label="Actualizar recomendações"
        >
          <RefreshCw size={16} strokeWidth={1.8} aria-hidden />
        </button>
      )}
    </div>
  );

  return (
    <SidebarBase header={header}>
      {loading && !summary && (
        <div className="neo-sidebar__skeleton" aria-live="polite">
          <span className="neo-sidebar__skeleton-bar" />
          <span className="neo-sidebar__skeleton-bar" />
        </div>
      )}
      <SidebarQuickMetrics metrics={quickMetrics} maxVisible={2} onNavigate={handleNavigate} />
      <nav className="neo-sidebar__nav" aria-label="Menu do cliente">
        {groups.map((group) => (
          <SidebarNavSection
            key={group.title}
            title={group.title}
            items={group.items}
            currentPath={path}
            isRail={isRail}
            onNavigate={handleNavigate}
          />
        ))}
      </nav>
      {highlights.length > 0 && (
        <SidebarHighlights title="Prioridades" items={highlights} onNavigate={handleNavigate} />
      )}
    </SidebarBase>
  );
}
