'use client';

import * as React from 'react';
import useSWR from 'swr';
import type { LandingSummary } from '@/lib/public/landing/types';
import { getFallbackLandingSummary } from '@/lib/fallback/auth-landing';

async function fetcher(url: string): Promise<LandingSummary> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Falha a carregar métricas públicas.');
  }
  const json = (await response.json()) as LandingSummary;
  if (!json?.ok) {
    throw new Error('Resposta inválida.');
  }
  return json;
}

export function useLandingSummary() {
  const fallback = React.useMemo(() => getFallbackLandingSummary(), []);
  const { data, error, isLoading, mutate } = useSWR<LandingSummary>(
    '/api/public/landing',
    fetcher,
    {
      fallbackData: fallback,
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
      refreshInterval: 120_000,
    },
  );

  const summary = data ?? fallback;
  const isFallback = summary.source !== 'live';

  return {
    summary,
    isFallback,
    isLoading: isLoading && !data,
    error,
    refresh: mutate,
  } as const;
}
