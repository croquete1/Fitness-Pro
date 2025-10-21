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
    walletBalance: 164,
    walletUpdatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    walletCredits30d: 280,
    walletDebits30d: 195,
    walletNet30d: 85,
  };
}

export function computeNavigationFallbackCounts(
  role: NavigationRole,
  counts: Partial<NavigationSummaryCounts>,
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
      walletBalance: counts.walletBalance ?? 0,
      walletUpdatedAt: counts.walletUpdatedAt ?? null,
      walletCredits30d: counts.walletCredits30d ?? 0,
      walletDebits30d: counts.walletDebits30d ?? 0,
      walletNet30d: counts.walletNet30d ?? 0,
    };
  }

  if (role === 'CLIENT') {
    return {
      approvalsPending: 0,
      notificationsUnread: counts.notificationsUnread ?? 3,
      messagesUnread: counts.messagesUnread ?? 1,
      onboardingPending: 0,
      clientsActive: counts.clientsActive ?? 1,
      trainersActive: counts.trainersActive ?? 1,
      sessionsToday: counts.sessionsToday ?? 1,
      sessionsUpcoming: counts.sessionsUpcoming ?? 3,
      plansActive: counts.plansActive ?? 2,
      invoicesPending: counts.invoicesPending ?? 1,
      revenueMonth: counts.revenueMonth ?? 0,
      revenuePending: counts.revenuePending ?? 45,
      satisfactionScore: counts.satisfactionScore ?? 4.9,
      libraryPersonal: counts.libraryPersonal ?? 0,
      libraryCatalog: counts.libraryCatalog ?? 48,
      libraryUpdatedAt: counts.libraryUpdatedAt ?? new Date().toISOString(),
      walletBalance: counts.walletBalance ?? 164,
      walletUpdatedAt: counts.walletUpdatedAt ?? new Date().toISOString(),
      walletCredits30d: counts.walletCredits30d ?? 220,
      walletDebits30d: counts.walletDebits30d ?? 145,
      walletNet30d: counts.walletNet30d ?? 75,
    };
  }

  return counts;
}

export function getNavigationFallbackWithOverrides(
  role: NavigationRole,
  overrides: Partial<NavigationSummaryCounts> = {},
  now = new Date(),
): NavigationSummary {
  const defaults = computeNavigationFallbackCounts(role, baseCounts(now));
  const counts = computeNavigationFallbackCounts(role, { ...defaults, ...overrides });
  return buildNavigationSummary({ role, now, counts });
}

export function getNavigationFallback(role: NavigationRole, now = new Date()): NavigationSummary {
  return getNavigationFallbackWithOverrides(role, {}, now);
}

export function getNavigationFallbackCounts(role: NavigationRole, now = new Date()): NavigationSummaryCounts {
  return computeNavigationFallbackCounts(role, baseCounts(now));
}

export const fallbackNavigationAdmin = getNavigationFallback('ADMIN');
export const fallbackNavigationTrainer = getNavigationFallback('TRAINER');
export const fallbackNavigationClient = getNavigationFallback('CLIENT');
