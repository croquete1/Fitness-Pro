export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PTLibraryClient from './PTLibraryClient';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { isAdmin, isPT, toAppRole } from '@/lib/roles';
import { loadTrainerLibraryDashboard } from '@/lib/trainer/library/server';

export const metadata: Metadata = { title: 'Biblioteca de exercícios' };

export default async function LibraryPtPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const userMeta = (session.user as { user_metadata?: { full_name?: string | null; name?: string | null } }).user_metadata;
  const viewerName = userMeta?.full_name ?? userMeta?.name ?? session.user.email ?? null;

  const result = await loadTrainerLibraryDashboard(session.user.id);
  return <PTLibraryClient initialData={result} viewerName={viewerName} />;
}
