'use client';

import * as React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { SidebarNavSection } from '@/components/layout/SidebarNav';
import SidebarHighlights from '@/components/layout/SidebarHighlights';
import SidebarQuickMetrics from '@/components/layout/SidebarQuickMetrics';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { useSidebarNavigationSummary } from '@/components/layout/useSidebarNavigationSummary';
import type { ClientCounts } from '@/lib/hooks/useCounts';
import type { NavigationSummary, NavigationSummaryCounts } from '@/lib/navigation/types';

type Props = {
  initialCounts?: ClientCounts;
  summary?: NavigationSummary | null;
  loading?: boolean;
  onRefreshNavigation?: () => Promise<unknown> | unknown;
};

export default function SidebarPT({ initialCounts, summary, loading, onRefreshNavigation }: Props) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile } = useSidebar();
  const isRail = !isMobile && collapsed && !peek;

  const handleNavigate = React.useCallback(() => {
    if (isMobile) closeMobile();
  }, [closeMobile, isMobile]);

  const messagesCount = initialCounts?.messagesCount ?? null;
  const notificationsCount = initialCounts?.notificationsCount ?? null;

  const fallbackOverrides = React.useMemo(() => {
    if (messagesCount == null && notificationsCount == null) return undefined;
    return {
      messagesUnread: messagesCount ?? undefined,
      notificationsUnread: notificationsCount ?? undefined,
    } satisfies Partial<NavigationSummaryCounts>;
  }, [messagesCount, notificationsCount]);

  const { groups: navGroups, quickMetrics, highlights, source, generatedAt } = useSidebarNavigationSummary({
    role: 'TRAINER',
    summary,
    fallbackOverrides,
  });

  const header = (
    <div className="neo-sidebar__headline">
      <div className="neo-sidebar__headline-meta">
        <span className="neo-sidebar__headline-label">Cockpit PT</span>
        {source && (
          <DataSourceBadge
            source={source}
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
        {navGroups.map((group) => (
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
