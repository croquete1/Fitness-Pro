'use client';

import useSWR from 'swr';
import type { NavigationSummary } from './types';

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load navigation summary (${response.status})`);
    }
    return response.json();
  });

export function useNavigationSummary(
  role: string | null | undefined,
  userId?: string | null,
  initial?: NavigationSummary | null,
) {
  const search = role
    ? `/api/navigation/summary?role=${encodeURIComponent(role)}${
        userId ? `&userId=${encodeURIComponent(userId)}` : ''
      }`
    : null;

  const { data, error, isLoading, mutate } = useSWR<NavigationSummary>(search, fetcher, {
    fallbackData: initial ?? undefined,
    revalidateOnFocus: true,
    dedupingInterval: 20_000,
  });

  return {
    summary: data ?? initial ?? null,
    loading: Boolean(isLoading && !data),
    error,
    refresh: mutate,
  };
}
