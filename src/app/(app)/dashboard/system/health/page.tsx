import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import SystemHealthClient from './SystemHealthClient';
import { loadSystemHealthDashboard } from '@/lib/system/health/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Saúde do Sistema' };

export default async function SystemHealthPage() {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN') redirect('/dashboard');

  const dashboard = await loadSystemHealthDashboard();

  return <SystemHealthClient initialData={dashboard} />;
}
