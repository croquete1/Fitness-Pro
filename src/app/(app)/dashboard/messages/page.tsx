export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadMessagesDashboard } from '@/lib/messages/server';
import MessagesDashboardClient from './MessagesDashboardClient';

const ALLOWED_RANGES = [7, 14, 30, 60, 90];

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function MessagesPage({ searchParams }: PageProps) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const rawRange = Array.isArray(searchParams?.range) ? searchParams?.range[0] : searchParams?.range;
  const parsedRange = Number(rawRange);
  const range = Number.isFinite(parsedRange) && ALLOWED_RANGES.includes(parsedRange) ? parsedRange : 14;

  const dashboard = await loadMessagesDashboard(session.user.id, range);

  return (
    <MessagesDashboardClient
      viewerId={session.user.id}
      initialRange={range}
      initialData={dashboard}
    />
  );
}
