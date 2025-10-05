'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(await r.text().catch(() => 'Request failed'));
  return (await r.json()) as { count: number };
};

type SWROpts = {
  refreshInterval?: number;
};

export function useHybridCount(
  url: string,
  initialCount: number,
  opts?: SWROpts
) {
  const { data, isLoading } = useSWR<{ count: number }>(
    url,
    fetcher,
    {
      fallbackData: { count: initialCount },
      revalidateOnFocus: true,
      refreshInterval: opts?.refreshInterval ?? 25_000,
      keepPreviousData: true,
    }
  );

  return { count: data?.count ?? initialCount, loading: isLoading };
}

export function useHybridAdminCounts(
  initial: { approvalsCount: number; notificationsCount: number }
) {
  const approvals = useHybridCount('/api/admin/approvals/count', initial.approvalsCount, { refreshInterval: 30_000 });
  const notifications = useHybridCount('/api/notifications/unread', initial.notificationsCount, { refreshInterval: 20_000 });
  return {
    approvalsCount: approvals.count,
    notificationsCount: notifications.count,
    loading: approvals.loading || notifications.loading,
  };
}

export function useHybridClientCounts(
  initial: { messagesCount: number; notificationsCount: number }
) {
  const messages = useHybridCount('/api/messages/unread', initial.messagesCount, { refreshInterval: 20_000 });
  const notifications = useHybridCount('/api/notifications/unread', initial.notificationsCount, { refreshInterval: 20_000 });
  return {
    messagesCount: messages.count,
    notificationsCount: notifications.count,
    loading: messages.loading || notifications.loading,
  };
}
