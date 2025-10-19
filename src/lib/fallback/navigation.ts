import { buildNavigationSummary } from '@/lib/navigation/summary';
import {
  type NavigationRole,
  type NavigationSummary,
  type NavigationSummaryCounts,
} from '@/lib/navigation/types';

function baseCounts(now: Date): NavigationSummaryCounts {
  const month = now.getMonth();
  const baseRevenue = 12500 + month * 320;
  return {
    approvalsPending: 4,
    notificationsUnread: 7,
    messagesUnread: 5,
    onboardingPending: 2,
    clientsActive: 86,
    trainersActive: 9,
    sessionsToday: 12,
    sessionsUpcoming: 28,
    plansActive: 54,
    invoicesPending: 6,
    revenueMonth: baseRevenue,
    revenuePending: 1450,
    satisfactionScore: 4.7,
    libraryPersonal: 32,
    libraryCatalog: 48,
    libraryUpdatedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
  };
}

export function computeNavigationFallbackCounts(
  role: NavigationRole,
  counts: NavigationSummaryCounts,
): NavigationSummaryCounts {
  if (role === 'TRAINER') {
    return {
      approvalsPending: 0,
      notificationsUnread: counts.notificationsUnread ?? 3,
      messagesUnread: counts.messagesUnread ?? 2,
      onboardingPending: 0,
      clientsActive: 18,
      trainersActive: 1,
      sessionsToday: 5,
      sessionsUpcoming: 16,
      plansActive: 14,
      invoicesPending: 0,
      revenueMonth: counts.revenueMonth ?? 0,
      revenuePending: counts.revenuePending ?? 0,
      satisfactionScore: counts.satisfactionScore ?? 4.6,
      libraryPersonal: counts.libraryPersonal ?? 22,
      libraryCatalog: counts.libraryCatalog ?? 45,
      libraryUpdatedAt: counts.libraryUpdatedAt ?? new Date().toISOString(),
    };
  }

  if (role === 'CLIENT') {
    return {
      approvalsPending: 0,
      notificationsUnread: 3,
      messagesUnread: 1,
      onboardingPending: 0,
      clientsActive: 1,
      trainersActive: 1,
      sessionsToday: 1,
      sessionsUpcoming: 3,
      plansActive: 2,
      invoicesPending: 1,
      revenueMonth: 0,
      revenuePending: 45,
      satisfactionScore: 4.9,
      libraryPersonal: counts.libraryPersonal ?? 0,
      libraryCatalog: counts.libraryCatalog ?? 48,
      libraryUpdatedAt: counts.libraryUpdatedAt ?? new Date().toISOString(),
    };
  }

  return counts;
}

export function getNavigationFallback(role: NavigationRole, now = new Date()): NavigationSummary {
  const base = baseCounts(now);
  const counts = computeNavigationFallbackCounts(role, base);
  return buildNavigationSummary({ role, now, counts });
}

export function getNavigationFallbackCounts(role: NavigationRole, now = new Date()): NavigationSummaryCounts {
  const base = baseCounts(now);
  return computeNavigationFallbackCounts(role, base);
}

export const fallbackNavigationAdmin = getNavigationFallback('ADMIN');
export const fallbackNavigationTrainer = getNavigationFallback('TRAINER');
export const fallbackNavigationClient = getNavigationFallback('CLIENT');
