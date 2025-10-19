import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadClientWalletDashboard } from '@/lib/client/wallet/server';
import ClientWalletClient from './ClientWalletClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Carteira do cliente' };

type PageProps = {
  searchParams?: {
    range?: string | string[] | undefined;
  };
};

function parseRange(value?: string | string[] | null): number {
  const raw = Array.isArray(value) ? value[value.length - 1] : value;
  if (!raw) return 30;
  const numeric = raw.endsWith('d') ? raw.slice(0, -1) : raw;
  const parsed = Number.parseInt(numeric, 10);
  if (Number.isNaN(parsed)) return 30;
  if (parsed < 7) return 7;
  if (parsed > 180) return 180;
  return parsed;
}

export default async function ClientWalletPage({ searchParams }: PageProps) {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const range = parseRange(searchParams?.range);
  const dashboard = await loadClientWalletDashboard(viewer.id, range);

  return <ClientWalletClient initialData={dashboard} initialRange={range} />;
}
