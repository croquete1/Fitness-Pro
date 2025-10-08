'use client';

import useSWR from 'swr';

type SWROpts = { revalidateOnFocus?: boolean; dedupingInterval?: number };

export type AdminCounts = {
  approvalsCount: number;
  notificationsCount: number;
};

export type ClientCounts = {
  messagesCount: number;
  notificationsCount: number;
};

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error(`Falha em ${url}`);
    return r.json();
  });

export function useAdminCounts(opts: SWROpts = { revalidateOnFocus: true, dedupingInterval: 5000 }) {
  const { data, error, isLoading, mutate } = useSWR<AdminCounts>('/api/admin/counts', fetcher, opts);
  return {
    approvalsCount: data?.approvalsCount ?? 0,
    notificationsCount: data?.notificationsCount ?? 0,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}

export function useClientCounts(opts: SWROpts = { revalidateOnFocus: true, dedupingInterval: 5000 }) {
  const { data, error, isLoading, mutate } = useSWR<ClientCounts>('/api/client/counts', fetcher, opts);
  return {
    messagesCount: data?.messagesCount ?? 0,
    notificationsCount: data?.notificationsCount ?? 0,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
