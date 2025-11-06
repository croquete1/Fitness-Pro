import type { ClientPlanDetail } from '@/lib/client/plans/detail/types';

export function getClientPlanDetailFallback(planId: string): ClientPlanDetail {
  return {
    id: planId,
    title: null,
    status: null,
    startDate: null,
    endDate: null,
    createdAt: null,
    clientId: null,
    trainerId: null,
    trainerName: null,
    trainerEmail: null,
    days: Array.from({ length: 7 }, (_, idx) => ({
      dayIndex: idx,
      items: [],
    })),
  } satisfies ClientPlanDetail;
}
