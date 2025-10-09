// src/lib/hooks/usePtsCounts.ts
'use client';

import useSWR, { KeyedMutator } from 'swr';

export type PtsCounts = { today: number; next7: number };

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

type HookResult = {
  today: number;
  next7: number;
  loading: boolean;
  error: any;
  refresh: KeyedMutator<PtsCounts>;
};

// Admin
export function useAdminPtsCounts(): HookResult {
  const { data, error, mutate } = useSWR<PtsCounts>('/api/admin/pts-schedule/counts', fetcher, {
    revalidateOnFocus: false,
  });
  return {
    today: Number(data?.today ?? 0),
    next7: Number(data?.next7 ?? 0),
    loading: !data && !error,
    error,
    refresh: mutate,
  };
}

// Trainer (próprio PT autenticado)
export function useTrainerPtsCounts(): HookResult {
  const { data, error, mutate } = useSWR<PtsCounts>('/api/trainer/pts-schedule/counts', fetcher, {
    revalidateOnFocus: false,
  });
  return {
    today: Number(data?.today ?? 0),
    next7: Number(data?.next7 ?? 0),
    loading: !data && !error,
    error,
    refresh: mutate,
  };
}
