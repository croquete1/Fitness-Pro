'use client';

import * as React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
      title: 'Overview',
      items: [
        {
          href: '/dashboard/pt',
          label: 'Painel',
          icon: 'dashboard',
          exact: true,
          activePrefix: '/dashboard/pt',
          description: 'Resumo diário com métricas de treino.',
        },
        {
          href: '/dashboard/pt/workouts',
          label: 'Sessões',
          icon: 'calendar',
          activePrefix: ['/dashboard/pt/workouts', '/dashboard/pt/schedule'],
          description: 'Agenda, confirmações e remarcações.',
        },
        {
          href: '/dashboard/pt/plans',
          label: 'Planos',
          icon: 'plans',
          activePrefix: ['/dashboard/pt/plans', '/dashboard/pt/training-plans'],
          description: 'Planos activos e planeamento semanal.',
        },
      ],
    },
    {
      title: 'Clientes',
      items: [
        {
          href: '/dashboard/pt/clients',
          label: 'Os meus clientes',
          icon: 'users',
          activePrefix: ['/dashboard/pt/clients'],
          description: 'Perfis, progresso e notas.',
        },
        {
          href: '/dashboard/history',
          label: 'Histórico',
          icon: 'history',
          activePrefix: ['/dashboard/history'],
          description: 'Sessões realizadas e avaliações.',
        },
      ],
    },
    {
      title: 'Biblioteca',
      items: [
        {
          href: '/dashboard/pt/library',
          label: 'Biblioteca',
          icon: 'library',
          activePrefix: ['/dashboard/pt/library'],
          description: 'Exercícios e playlists personalizadas.',
        },
        {
          href: '/dashboard/admin/exercises',
          label: 'Catálogo global',
          icon: 'dumbbell',
          activePrefix: ['/dashboard/admin/exercises'],
          description: 'Referência de exercícios aprovados.',
        },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        {
          href: '/dashboard/pt/messages',
          label: 'Mensagens',
          icon: 'messages',
          activePrefix: ['/dashboard/pt/messages', '/dashboard/messages'],
          badge: messages || null,
          tone: messages > 0 ? 'warning' : undefined,
          description: 'Chats com clientes e colegas.',
        },
        {
          href: '/dashboard/notifications',
          label: 'Notificações',
          icon: 'notifications',
          activePrefix: ['/dashboard/notifications'],
          badge: notifications || null,
          tone: notifications > 0 ? 'warning' : undefined,
          description: 'Alertas de presença e sistema.',
        },
      ],
    },
    {
      title: 'Conta',
      items: [
        {
          href: '/dashboard/profile',
          label: 'Perfil',
          icon: 'profile',
          activePrefix: ['/dashboard/profile'],
          description: 'Informação pessoal e disponibilidade.',
        },
        {
          href: '/dashboard/settings',
          label: 'Definições',
          icon: 'settings',
          activePrefix: ['/dashboard/settings'],
          description: 'Preferências de notificações e integrações.',
        },
      ],
    },
  ];
};

const describePendingMessages = (pending: number) => {
  if (pending <= 0) return 'Inbox limpa — nada pendente.';
  return `${pending} ${pending === 1 ? 'conversa aguarda' : 'conversas aguardam'} resposta.`;
};

const describeOperationalAlerts = (pending: number) => {
  if (pending <= 0) return 'Sem alertas operacionais.';
  return `${pending} ${pending === 1 ? 'alerta operacional' : 'alertas operacionais'} por rever.`;
};

const FALLBACK_HIGHLIGHTS = (counts?: ClientCounts): NavigationHighlight[] => {
  const messages = counts?.messagesCount ?? 0;
  const notifications = counts?.notificationsCount ?? 0;
  return [
    {
      id: 'flow-plan',
      title: 'Assistente de planos',
      description: 'Segue o fluxo guiado para desenhar planos em minutos.',
      href: '/dashboard/pt/plans/new',
      icon: 'plans',
      tone: 'primary',
    },
    {
      id: 'session-book',
      title: 'Agendar sessão rápida',
      description: 'Marca uma sessão avulsa sem sair do painel.',
      href: '/dashboard/pt/sessions/new',
      icon: 'calendar-plus',
      tone: 'positive',
    },
    {
      id: 'messages',
      title: 'Mensagens por ler',
      description: describePendingMessages(messages),
      href: '/dashboard/messages',
      icon: 'messages',
      tone: messages > 0 ? 'warning' : undefined,
    },
    {
      id: 'alerts',
      title: 'Alertas operacionais',
      description: describeOperationalAlerts(notifications),
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

export default function SidebarPT({ initialCounts, summary, loading, onRefreshNavigation }: Props) {
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
        <span className="neo-sidebar__headline-label">Cockpit PT</span>
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
          aria-label="Actualizar métrica do cockpit"
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
          <span className="neo-sidebar__skeleton-bar" />
        </div>
      )}
      <SidebarQuickMetrics metrics={quickMetrics} maxVisible={3} onNavigate={handleNavigate} />
      <nav className="neo-sidebar__nav" aria-label="Menu do personal trainer">
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
        <SidebarHighlights title="Fluxo recomendado" items={highlights} onNavigate={handleNavigate} />
      )}
    </SidebarBase>
  );
}
