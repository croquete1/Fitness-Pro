import type { ClientPlanDetail } from '@/lib/client/plans/detail/types';

export function getClientPlanDetailFallback(planId: string): ClientPlanDetail {
  const days = Array.from({ length: 7 }, (_, idx) => ({
    dayIndex: idx,
    items: [] as ClientPlanDetail['days'][number]['items'],
  }));

  return {
    id: planId,
    title: 'Plano indisponível offline',
    status: 'DRAFT',
    startDate: null,
    endDate: null,
    createdAt: new Date().toISOString(),
    clientId: null,
    trainerId: null,
    trainerName: null,
    trainerEmail: null,
    days,
  } satisfies ClientPlanDetail;
}
