import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadSystemLogsDashboard } from '@/lib/system/logs/server';
import AuditLogsClient from './AuditLogsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = { title: 'Logs de auditoria' };

const ALLOWED_RANGES = [7, 14, 30, 60, 90] as const;

type PageProps = {
  searchParams?: { range?: string };
};

export default async function Page({ searchParams }: PageProps) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const rawRange = Number(searchParams?.range);
  const rangeDays = ALLOWED_RANGES.includes(rawRange as (typeof ALLOWED_RANGES)[number]) ? rawRange : 14;

  const dashboard = await loadSystemLogsDashboard(rangeDays);

  return <AuditLogsClient initialData={dashboard} initialRange={rangeDays} />;
}
