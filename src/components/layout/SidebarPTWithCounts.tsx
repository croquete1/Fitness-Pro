'use client';

import SidebarPT from './SidebarPT';
import { useHeaderCounts } from '@/components/header/HeaderCountsContext';

export type TrainerCounts = {
  messagesCount?: number;
  notificationsCount?: number;
};

type Props = {
  initial?: TrainerCounts;
};

export default function SidebarPTWithCounts({ initial }: Props) {
  const { messagesCount, notificationsCount, loading } = useHeaderCounts();

  const msgs = loading && initial?.messagesCount !== undefined ? initial.messagesCount : messagesCount;
  const notifs = loading && initial?.notificationsCount !== undefined ? initial.notificationsCount : notificationsCount;

  return (
    <SidebarPT
      messagesCount={msgs ?? 0}
      notificationsCount={notifs ?? 0}
    />
  );
}
