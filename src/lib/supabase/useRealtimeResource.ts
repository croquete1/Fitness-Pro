'use client';

import * as React from 'react';
import useSWR, { type Fetcher, type Key, type SWRConfiguration } from 'swr';
import { useSupabaseRealtime, type SubscriptionConfig } from '@/lib/supabase/useRealtime';

type UseRealtimeResourceOptions<Data, FetchKey extends Key> = {
  key: FetchKey;
  fetcher: Fetcher<Data, FetchKey>;
  initialData?: Data;
  channel: string;
  subscriptions: SubscriptionConfig[];
  realtimeEnabled?: boolean;
  throttleMs?: number;
  swr?: Omit<SWRConfiguration<Data, Error, Fetcher<Data, FetchKey>>, 'fallbackData'> & {
    fallbackData?: Data;
  };
};

type UseRealtimeResourceResult<Data, FetchKey extends Key> = {
  data: Data | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: ReturnType<typeof useSWR<Data, Error, FetchKey>>['mutate'];
  refresh: () => Promise<Data | undefined>;
  scheduleRealtimeRefresh: () => void;
};

export function useRealtimeResource<Data, FetchKey extends Key>(
  options: UseRealtimeResourceOptions<Data, FetchKey>,
): UseRealtimeResourceResult<Data, FetchKey> {
  const {
    key,
    fetcher,
    initialData,
    channel,
    subscriptions,
    realtimeEnabled = true,
    throttleMs = 450,
    swr,
  } = options;

  const swrOptions: SWRConfiguration<Data, Error, Fetcher<Data, FetchKey>> = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    ...swr,
  };

  if (initialData !== undefined && swrOptions.fallbackData === undefined) {
    swrOptions.fallbackData = initialData;
  }

  const swrResult = useSWR<Data, Error, FetchKey>(key, fetcher, swrOptions);
  const { data, error, isLoading, isValidating, mutate } = swrResult;

  const timerRef = React.useRef<number | null>(null);

  const refresh = React.useCallback(() => mutate(), [mutate]);

  const scheduleRealtimeRefresh = React.useCallback(() => {
    if (typeof window === 'undefined') {
      void mutate();
      return;
    }
    if (timerRef.current !== null) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void mutate();
    }, throttleMs);
  }, [mutate, throttleMs]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const shouldSubscribe =
    realtimeEnabled && Boolean(channel) && Array.isArray(subscriptions) && subscriptions.length > 0;

  useSupabaseRealtime(channel, subscriptions, scheduleRealtimeRefresh, { enabled: shouldSubscribe });

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh,
    scheduleRealtimeRefresh,
  } satisfies UseRealtimeResourceResult<Data, FetchKey>;
}
