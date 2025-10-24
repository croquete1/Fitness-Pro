'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import SidebarBase from '@/components/layout/SidebarBase';
import SidebarHighlights from '@/components/layout/SidebarHighlights';
import { SidebarNavSection } from '@/components/layout/SidebarNav';
import SidebarQuickMetrics from '@/components/layout/SidebarQuickMetrics';
import { useSidebar } from '@/components/layout/SidebarProvider';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { useSidebarNavigationSummary } from '@/components/layout/useSidebarNavigationSummary';
import type { AdminCounts } from '@/lib/hooks/useCounts';
import type { NavigationSummary, NavigationSummaryCounts } from '@/lib/navigation/types';

type Props = {
  initialCounts?: AdminCounts;
  summary?: NavigationSummary | null;
  loading?: boolean;
  onRefreshNavigation?: () => Promise<unknown> | unknown;
};

export default function SidebarAdmin({ initialCounts, summary, loading, onRefreshNavigation }: Props) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile } = useSidebar();
  const isRail = !isMobile && collapsed && !peek;
  const handleNavigate = React.useCallback(() => {
    if (isMobile) closeMobile();
  }, [closeMobile, isMobile]);

  const fallbackOverrides = React.useMemo(() => {
    if (!initialCounts) return undefined;
    const overrides: Partial<NavigationSummaryCounts> = {};
    if (typeof initialCounts.approvalsCount === 'number') {
      overrides.approvalsPending = initialCounts.approvalsCount;
    }
    if (typeof initialCounts.notificationsCount === 'number') {
      overrides.notificationsUnread = initialCounts.notificationsCount;
    }
    return Object.keys(overrides).length > 0 ? overrides : undefined;
  }, [initialCounts]);

  const { groups, quickMetrics, highlights, source, generatedAt } = useSidebarNavigationSummary({
    role: 'ADMIN',
    summary,
    fallbackOverrides,
  });

  const header = (
    <div className="neo-sidebar__headline">
      <div className="neo-sidebar__headline-meta">
        <span className="neo-sidebar__headline-label">Navegação</span>
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
      <SidebarQuickMetrics metrics={quickMetrics} maxVisible={3} onNavigate={handleNavigate} />
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
      {highlights.length > 0 && (
        <SidebarHighlights title="Alertas" items={highlights} onNavigate={handleNavigate} />
      )}
    </SidebarBase>
  );
}
