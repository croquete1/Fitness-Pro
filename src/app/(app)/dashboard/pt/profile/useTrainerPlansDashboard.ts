'use client';

import useSWR from 'swr';

import type { TrainerPlansDashboardPayload } from '@/lib/trainer/plans/types';

const ENDPOINT = '/api/pt/plans/dashboard';

const fetcher = async (url: string): Promise<TrainerPlansDashboardPayload> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar os planos.');
  }

  const payload = (await response.json()) as TrainerPlansDashboardPayload | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || (payload as { ok?: boolean }).ok !== true) {
    throw new Error((payload as { message?: string })?.message ?? 'Não foi possível sincronizar os planos.');
  }

  return payload as TrainerPlansDashboardPayload;
};

export function useTrainerPlansDashboard(initialData: TrainerPlansDashboardPayload) {
  return useSWR<TrainerPlansDashboardPayload>(ENDPOINT, fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });
}

export { fetcher as fetchTrainerPlansDashboard };
