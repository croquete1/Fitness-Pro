'use client';

import * as React from 'react';
import type { RealtimePostgresChangesPayload, RealtimePostgresChangesFilter } from '@supabase/supabase-js';
import { tryGetSupabaseBrowserClient } from '@/lib/supabaseBrowser';

export type SubscriptionConfig = {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table: string;
  filter?: string;
};

export type UseSupabaseRealtimeOptions = {
  enabled?: boolean;
};

type NormalizedSubscription = {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema: string;
  table: string;
  filter: string | null;
};

export function useSupabaseRealtime<Row = Record<string, unknown>>(
  channelName: string,
  subscriptions: SubscriptionConfig[],
  onChange: (payload: RealtimePostgresChangesPayload<Row>) => void,
  options: UseSupabaseRealtimeOptions = {},
) {
  const handlerRef = React.useRef(onChange);
  handlerRef.current = onChange;

  const normalized = React.useMemo<NormalizedSubscription[]>(
    () =>
      subscriptions.map((subscription) => ({
        event: subscription.event ?? '*',
        schema: subscription.schema ?? 'public',
        table: subscription.table,
        filter: subscription.filter ?? null,
      })),
    [subscriptions],
  );

  const configKey = React.useMemo(() => JSON.stringify(normalized), [normalized]);

  React.useEffect(() => {
    if (options.enabled === false) return undefined;

    const client = tryGetSupabaseBrowserClient();
    if (!client) return undefined;

    const channel = client.channel(channelName);

    normalized.forEach((config) => {
      const filter: RealtimePostgresChangesFilter<any> = {
        event: config.event,
        schema: config.schema,
        table: config.table,
        filter: config.filter ?? undefined,
      };

      channel.on(
        'postgres_changes',
        filter,
        (payload) => {
          handlerRef.current(payload as RealtimePostgresChangesPayload<Row>);
        },
      );
    });

    const subscription = channel.subscribe();

    return () => {
      void subscription.unsubscribe();
    };
  }, [channelName, configKey, normalized, options.enabled]);
}
