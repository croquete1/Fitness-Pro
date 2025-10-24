'use client';

import * as React from 'react';
import { getNavigationFallbackWithOverrides } from '@/lib/fallback/navigation';
import type {
  NavigationHighlight,
  NavigationQuickMetric,
  NavigationRole,
  NavigationSummary,
  NavigationSummaryCounts,
  NavigationSummaryGroup,
} from '@/lib/navigation/types';
import type { SidebarNavItem } from '@/components/layout/SidebarNav';

type Options = {
  role: NavigationRole;
  summary?: NavigationSummary | null;
  fallbackOverrides?: Partial<NavigationSummaryCounts>;
};

type SidebarGroup = { title: string; items: SidebarNavItem[] };

type Result = {
  groups: SidebarGroup[];
  quickMetrics: NavigationQuickMetric[];
  highlights: NavigationHighlight[];
  source: 'supabase' | 'fallback' | undefined;
  generatedAt: string | null;
};

function dedupeById<T extends { id: string }>(items?: T[] | null): T[] {
  if (!items || items.length === 0) return [];
  const seen = new Set<string>();
  const deduped: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }
  return deduped;
}

function mapGroup(group: NavigationSummaryGroup): SidebarGroup {
  const seen = new Set<string>();
  const items: SidebarNavItem[] = [];
  for (const item of group.items) {
    const dedupeKey = item.id ?? item.href;
    if (dedupeKey && seen.has(dedupeKey)) continue;
    if (dedupeKey) seen.add(dedupeKey);

    items.push({
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
    });
  }
  return { title: group.title, items };
}

export function useSidebarNavigationSummary({ role, summary, fallbackOverrides }: Options): Result {
  const fallbackSummary = React.useMemo(
    () => (summary ? null : getNavigationFallbackWithOverrides(role, fallbackOverrides ?? {})),
    [summary, role, fallbackOverrides],
  );

  const effectiveSummary = summary ?? fallbackSummary;
  const usingFallback = !summary && Boolean(fallbackSummary);

  const navGroups = React.useMemo(() => {
    if (!effectiveSummary) return [];
    const groups = effectiveSummary.navGroups
      .map(mapGroup)
      .map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
          ...item,
          badge: usingFallback ? null : item.badge,
          kpiLabel: usingFallback ? null : item.kpiLabel,
          kpiValue: usingFallback ? null : item.kpiValue,
        })),
      }))
      .filter((group) => group.items.length > 0);

    return groups;
  }, [effectiveSummary, usingFallback]);

  const metricList = React.useMemo(() => {
    if (!effectiveSummary || usingFallback) return [];
    return dedupeById<NavigationQuickMetric>(effectiveSummary.quickMetrics);
  }, [effectiveSummary, usingFallback]);

  const highlightList = React.useMemo(() => {
    if (!effectiveSummary || usingFallback) return [];
    return dedupeById<NavigationHighlight>(effectiveSummary.highlights);
  }, [effectiveSummary, usingFallback]);

  const dataSource = React.useMemo<'supabase' | 'fallback' | undefined>(() => {
    if (summary) return 'supabase';
    if (effectiveSummary) return 'fallback';
    return undefined;
  }, [summary, effectiveSummary]);

  const generatedAt = effectiveSummary?.updatedAt ?? null;

  return {
    groups: navGroups,
    quickMetrics: metricList,
    highlights: highlightList,
    source: dataSource,
    generatedAt,
  };
}
