import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadSettingsContext, loadSettingsDashboard } from '@/lib/settings/server';
import type { SettingsDashboardResponse } from '@/lib/settings/types';

import SettingsClient from './settings-client';

export const metadata: Metadata = { title: 'Definições' };

export default async function SettingsPage() {
  const session = await getSessionUserSafe();
  if (!session?.id) redirect('/login');

  const contextResult = await loadSettingsContext(session.id, {
    name: session.name,
    email: session.email,
    role: session.role,
  });

  const dashboardResult = await loadSettingsDashboard(session.id, {
    rangeDays: 30,
    session: {
      name: session.name,
      email: session.email,
      role: session.role,
    },
    context: contextResult.context,
  });

  const initialDashboard: SettingsDashboardResponse = {
    ok: true,
    source: dashboardResult.source,
    ...dashboardResult.data,
  };

  return (
    <main className="settings-page">
      <SettingsClient model={dashboardResult.context.model} initialDashboard={initialDashboard} />
    </main>
  );
}
