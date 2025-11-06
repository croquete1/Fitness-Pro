import { buildNavigationSummary } from '@/lib/navigation/summary';
import {
  type NavigationRole,
  type NavigationSummary,
  type NavigationSummaryCounts,
} from '@/lib/navigation/types';

function baseCounts(): NavigationSummaryCounts {
  return {
    approvalsPending: 0,
    notificationsUnread: 0,
    messagesUnread: 0,
    onboardingPending: 0,
    clientsActive: 0,
    trainersActive: 0,
    sessionsToday: 0,
    sessionsUpcoming: 0,
    plansActive: 0,
    invoicesPending: 0,
    revenueMonth: 0,
    revenuePending: 0,
    satisfactionScore: null,
    libraryPersonal: 0,
    libraryCatalog: 0,
    libraryUpdatedAt: null,
    walletBalance: 0,
    walletUpdatedAt: null,
    walletCredits30d: 0,
    walletDebits30d: 0,
    walletNet30d: 0,
  };
}

export function computeNavigationFallbackCounts(
  _role: NavigationRole,
  counts: Partial<NavigationSummaryCounts>,
): NavigationSummaryCounts {
  return { ...baseCounts(), ...counts };
}

export function getNavigationFallbackWithOverrides(
  role: NavigationRole,
  overrides: Partial<NavigationSummaryCounts> = {},
  now = new Date(),
): NavigationSummary {
  const counts = computeNavigationFallbackCounts(role, overrides);
  return buildNavigationSummary({ role, now, counts });
}

export function getNavigationFallback(role: NavigationRole, now = new Date()): NavigationSummary {
  return getNavigationFallbackWithOverrides(role, {}, now);
}

export function getNavigationFallbackCounts(role: NavigationRole, _now = new Date()): NavigationSummaryCounts {
  return computeNavigationFallbackCounts(role, {});
}

export const fallbackNavigationAdmin = getNavigationFallback('ADMIN');
export const fallbackNavigationTrainer = getNavigationFallback('TRAINER');
export const fallbackNavigationClient = getNavigationFallback('CLIENT');
