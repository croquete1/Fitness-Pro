export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import SystemMetricsClient from './SystemMetricsClient';
import { loadSystemDashboard } from '@/lib/system/server';

const ALLOWED_RANGES = [7, 14, 30, 60];

type PageProps = {
  searchParams?: { range?: string };
};

export default async function SystemMetricsPage({ searchParams }: PageProps) {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN') redirect('/dashboard');

  const parsedRange = Number(searchParams?.range ?? '14');
  const rangeDays = ALLOWED_RANGES.includes(parsedRange) ? parsedRange : 14;

  const dashboard = await loadSystemDashboard(rangeDays);

  return <SystemMetricsClient initialData={dashboard} initialRange={rangeDays} />;
}
