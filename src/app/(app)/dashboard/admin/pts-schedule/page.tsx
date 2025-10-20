import AdminPtsScheduleClient from './AdminPtsScheduleClient';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { loadAdminPtsScheduleDashboard } from '@/lib/admin/pts-schedule/dashboard';
import { getAdminPtsScheduleFallback } from '@/lib/fallback/admin-pts-schedule';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const now = new Date();
  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getAdminPtsScheduleFallback(now);
    return <AdminPtsScheduleClient initialData={{ ...fallback, ok: true, source: 'fallback' }} />;
  }

  try {
    const dataset = await loadAdminPtsScheduleDashboard(sb, { now });
    return <AdminPtsScheduleClient initialData={{ ...dataset, ok: true, source: 'supabase' }} />;
  } catch (error) {
    console.error('[admin/pts-schedule] fallback no load inicial', error);
    const fallback = getAdminPtsScheduleFallback(now);
    return <AdminPtsScheduleClient initialData={{ ...fallback, ok: true, source: 'fallback' }} />;
  }
}
