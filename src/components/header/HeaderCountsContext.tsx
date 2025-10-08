'use client';

import * as React from 'react';
import { useAdminCounts, useClientCounts, type AdminCounts, type ClientCounts } from '@/lib/hooks/useCounts';

type Role = 'ADMIN' | 'CLIENT';

type HeaderCountsInitial = { admin?: AdminCounts; client?: ClientCounts };

type Ctx = {
  role: Role;
  approvalsCount?: number;
  messagesCount?: number;
  notificationsCount: number;
  loading: boolean;
};

const HeaderCountsContext = React.createContext<Ctx | null>(null);

export function HeaderCountsProvider({
  role,
  initial,
  children,
}: {
  role: Role;
  initial?: HeaderCountsInitial;
  children: React.ReactNode;
}) {
  const admin = useAdminCounts();
  const client = useClientCounts();

  let value: Ctx;

  if (role === 'ADMIN') {
    const approvals = admin.loading ? (initial?.admin?.approvalsCount ?? 0) : admin.approvalsCount;
    const notifs = admin.loading ? (initial?.admin?.notificationsCount ?? 0) : admin.notificationsCount;
    value = { role, approvalsCount: approvals, notificationsCount: notifs, loading: admin.loading };
  } else {
    const msgs = client.loading ? (initial?.client?.messagesCount ?? 0) : client.messagesCount;
    const notifs = client.loading ? (initial?.client?.notificationsCount ?? 0) : client.notificationsCount;
    value = { role, messagesCount: msgs, notificationsCount: notifs, loading: client.loading };
  }

  return <HeaderCountsContext.Provider value={value}>{children}</HeaderCountsContext.Provider>;
}

export function useHeaderCounts() {
  const ctx = React.useContext(HeaderCountsContext);
  if (!ctx) {
    // Fallback neutro caso o provider não esteja acima
    return { role: 'CLIENT' as const, messagesCount: 0, notificationsCount: 0, loading: false } as Ctx;
  }
  return ctx;
}
