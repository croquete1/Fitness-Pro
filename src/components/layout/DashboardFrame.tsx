'use client';

import * as React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import {
  HeaderCountsProvider,
  type HeaderCounts,
} from '@/components/header/HeaderCountsContext';
import type { NavigationSummary } from '@/lib/navigation/types';
import { useNavigationSummary } from '@/lib/navigation/useNavigationSummary';

type Props = {
  role?: string | null;
  userId?: string | null;
  userLabel?: string | null;
  initialCounts?: Partial<HeaderCounts>;
  initialNavigation?: NavigationSummary | null;
  children: React.ReactNode;
};

export default function DashboardFrame({
  role = null,
  userId = null,
  userLabel,
  initialCounts,
  initialNavigation,
  children,
}: Props) {
  const normalisedRole = React.useMemo(
    () => (role ? String(role).toUpperCase() : 'CLIENT'),
    [role],
  );

  const adminInitial = initialCounts
    ? {
        approvalsCount: initialCounts.approvalsCount ?? 0,
        notificationsCount: initialCounts.notificationsCount ?? 0,
      }
    : undefined;

  const audienceInitial = initialCounts
    ? {
        messagesCount: initialCounts.messagesCount ?? 0,
        notificationsCount: initialCounts.notificationsCount ?? 0,
      }
    : undefined;

  const { summary, loading: navigationLoading, refresh: refreshNavigation } =
    useNavigationSummary(normalisedRole, userId, initialNavigation);

  return (
    <HeaderCountsProvider role={(normalisedRole as any) ?? null} initial={initialCounts ?? {}}>
      <div className="neo-shell" data-role={normalisedRole}>
        <AppHeader
          role={normalisedRole as any}
          userLabel={userLabel ?? undefined}
          navigationSummary={summary}
          navigationLoading={navigationLoading}
          onRefreshNavigation={refreshNavigation}
        />
        <div className="neo-shell__body">
          <RoleSidebar
            role={normalisedRole}
            initialCounts={{
              admin: adminInitial,
              client: audienceInitial,
              trainer: audienceInitial,
            }}
            navigationSummary={summary}
            navigationLoading={navigationLoading}
            onRefreshNavigation={refreshNavigation}
          />
          <main className="neo-shell__main">{children}</main>
        </div>
      </div>
    </HeaderCountsProvider>
  );
}
