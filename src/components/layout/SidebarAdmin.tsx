'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { SidebarNavSection, type SidebarNavItem } from '@/components/layout/SidebarNav';
import type { AdminCounts } from '@/lib/hooks/useCounts';
import type { NavigationSummary, NavigationSummaryGroup } from '@/lib/navigation/types';

type Props = {
  initialCounts?: AdminCounts;
  summary?: NavigationSummary | null;
  loading?: boolean;
  onRefreshNavigation?: () => Promise<unknown> | unknown;
};

const FALLBACK_GROUPS = (counts?: AdminCounts): { title: string; items: SidebarNavItem[] }[] => {
  const approvals = counts?.approvalsCount ?? 0;
  const notifications = counts?.notificationsCount ?? 0;
  return [
    {
      title: 'Administração',
      items: [
        {
          href: '/dashboard/admin',
          label: 'Painel',
          icon: 'dashboard',
          exact: true,
          activePrefix: '/dashboard/admin',
          description: 'Resumo executivo com métricas operacionais.',
        },
        {
          href: '/dashboard/admin/approvals',
          label: 'Aprovações',
          icon: 'check-circle',
          activePrefix: '/dashboard/admin/approvals',
          badge: approvals,
          tone: approvals > 0 ? 'warning' : 'neutral',
          description: 'Pedidos de acesso e alterações pendentes.',
        },
        {
          href: '/dashboard/admin/users',
          label: 'Utilizadores',
          icon: 'users',
          activePrefix: '/dashboard/admin/users',
          description: 'Perfis, funções e permissões da equipa.',
        },
      ],
    },
    {
      title: 'Gestão',
      items: [
        {
          href: '/dashboard/admin/exercises',
          label: 'Biblioteca',
          icon: 'library',
          activePrefix: '/dashboard/admin/exercises',
          description: 'Exercícios, playlists e templates validados.',
        },
        {
          href: '/dashboard/admin/plans',
          label: 'Planos',
          icon: 'plans',
          activePrefix: '/dashboard/admin/plans',
          description: 'Planos corporativos e catálogos PT.',
        },
        {
          href: '/dashboard/admin/pts-schedule',
          label: 'Agenda PTs',
          icon: 'calendar',
          activePrefix: '/dashboard/admin/pts-schedule',
          description: 'Disponibilidade e sessões agendadas.',
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          href: '/dashboard/system',
          label: 'Centro de controlo',
          icon: 'system',
          activePrefix: '/dashboard/system',
          description: 'Estado geral e dependências críticas.',
          exact: true,
        },
        {
          href: '/dashboard/system/metrics',
          label: 'Métricas',
          icon: 'metrics',
          activePrefix: '/dashboard/system/metrics',
          description: 'Indicadores globais de utilização.',
        },
        {
          href: '/dashboard/system/logs',
          label: 'Logs e auditoria',
          icon: 'terminal',
          activePrefix: '/dashboard/system/logs',
          description: 'Autenticação, auditoria e histórico técnico.',
        },
      ],
    },
    {
      title: 'Definições',
      items: [
        {
          href: '/dashboard/admin/notifications',
          label: 'Notificações',
          icon: 'notifications',
          activePrefix: '/dashboard/admin/notifications',
          badge: notifications,
          tone: notifications > 0 ? 'warning' : 'neutral',
          description: 'Campanhas e alertas operacionais.',
        },
        {
          href: '/dashboard/settings',
          label: 'Definições',
          icon: 'settings',
          activePrefix: '/dashboard/settings',
          description: 'Preferências da conta e integrações.',
        },
      ],
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

export default function SidebarAdmin({ initialCounts, summary, loading, onRefreshNavigation }: Props) {
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

  const quickMetrics = React.useMemo(() => summary?.quickMetrics?.slice(0, 3) ?? [], [summary]);

  const header = (
    <div className="neo-sidebar__headline">
      <span className="neo-sidebar__headline-label">Navegação</span>
      {onRefreshNavigation && (
        <button
          type="button"
          className="neo-sidebar__headline-action"
          onClick={() => onRefreshNavigation()}
          aria-label="Actualizar métricas da navegação"
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
      {quickMetrics.length > 0 && (
        <div className="neo-sidebar__quick">
          {quickMetrics.map((metric) => (
            <div key={metric.id} className={`neo-sidebar__quick-card neo-sidebar__quick-card--${metric.tone}`}>
              <span className="neo-sidebar__quick-label">{metric.label}</span>
              <span className="neo-sidebar__quick-value">{metric.value}</span>
              {metric.hint && <span className="neo-sidebar__quick-hint">{metric.hint}</span>}
            </div>
          ))}
        </div>
      )}
      <nav className="neo-sidebar__nav" aria-label="Menu administrador">
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
    </SidebarBase>
  );
}
