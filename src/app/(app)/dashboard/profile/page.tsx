import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadProfileDashboard } from '@/lib/profile/server';
import type { ProfileDashboardResponse } from '@/lib/profile/types';

import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Perfil' };

export default async function ProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.id) redirect('/login');

  const dashboardResult = await loadProfileDashboard(session.id, {
    email: session.email,
    name: session.name,
    role: session.role,
  });

  const initialDashboard: ProfileDashboardResponse = {
    ok: true,
    source: dashboardResult.source,
    ...dashboardResult.data,
  };

  return (
    <main className="profile-dashboard-page">
      <ProfileClient initialDashboard={initialDashboard} />
    </main>
  );
}
