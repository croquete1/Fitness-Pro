export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import AdminClientsClient from './AdminClientsClient';
import { loadAdminClientsDashboard } from '@/lib/admin/clients/server';

const RANGE_OPTIONS = new Set(['12w', '24w', '36w']);

type PageProps = {
  searchParams?: {
    range?: '12w' | '24w' | '36w' | string;
  };
};

function clampRange(value?: string | null): '12w' | '24w' | '36w' {
  if (value && RANGE_OPTIONS.has(value)) return value as '12w' | '24w' | '36w';
  return '12w';
}

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const range = clampRange(searchParams?.range);
  const response = await loadAdminClientsDashboard({ range });
  return <AdminClientsClient initialData={response.data} />;
}
