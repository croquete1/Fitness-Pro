'use client';

import useSWR from 'swr';

export type PtsCounts = { today: number; next7: number };

const fetcher = async (url: string): Promise<PtsCounts> => {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  // tolerante a chaves alternativas (se algum endpoint antigo ainda responder diferente)
  return {
    today: typeof j.today === 'number' ? j.today : (j.todayCount ?? 0),
    next7: typeof j.next7 === 'number' ? j.next7 : (j.next7DaysCount ?? 0),
  };
};

/** Admin: conta sessões globais (RLS pode limitar, mas o admin vê tudo) */
export function usePtsCounts() {
  const { data, error, isLoading, mutate } = useSWR<PtsCounts>(
    '/api/admin/pts-schedule/counts',
    fetcher,
    { revalidateOnFocus: false }
  );
  return {
    today: data?.today ?? 0,
    next7: data?.next7 ?? 0,
    loading: !!isLoading,
    error,
    refresh: mutate,
  };
}

/** PT: conta apenas sessões do próprio treinador (RLS + endpoint dedicado) */
export function useTrainerPtsCounts() {
  const { data, error, isLoading, mutate } = useSWR<PtsCounts>(
    '/api/trainer/pts-schedule/counts',
    fetcher,
    { revalidateOnFocus: false }
  );
  return {
    today: data?.today ?? 0,
    next7: data?.next7 ?? 0,
    loading: !!isLoading,
    error,
    refresh: mutate,
  };
}

export default usePtsCounts;
