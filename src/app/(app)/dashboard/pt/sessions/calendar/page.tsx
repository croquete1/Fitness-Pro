export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import SchedulerClient, { type WeekItem, type Block } from '../ui/SchedulerClient';


function startOfWeek(date = new Date()) {
  const d = new Date(date); const day = d.getDay() || 7; if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0,0,0,0); return d;
}
function endOfWeek(date = new Date()) {
  const d = startOfWeek(date); d.setDate(d.getDate() + 7); return d;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');

  const role = toAppRole(user.role) || 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard'); // só PT/Admin

  const sb = createServerClient();

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(weekStart);

  // sessões desta semana
  const { data: s = [] } = await sb
    .from('pt_sessions')
    .select('id,trainer_id,client_id,location_id,start,end,title')
    .eq('trainer_id', user.id)
    .gte('start', weekStart.toISOString())
    .lt('start', weekEnd.toISOString())
    .order('start', { ascending: true });

  const sessions: WeekItem[] = (s ?? []).map((x) => ({
    id: x.id, start: x.start, end: x.end, title: x.title, client_id: x.client_id, location_id: x.location_id,
  }));

  // folgas (bloqueios) desta semana → Block[] com id ✔
  const { data: f = [] } = await sb
    .from('pt_time_off')
    .select('id,start,end,title')
    .eq('trainer_id', user.id)
    .lt('start', weekEnd.toISOString())
    .gte('end', weekStart.toISOString())
    .order('start', { ascending: true });

  const blocks: Block[] = (f ?? []).map((b) => ({
    id: b.id, start: b.start, end: b.end, title: b.title ?? 'Folga',
  }));

  // opções auxiliares
  const { data: clients = [] } = await sb
    .from('users')
    .select('id,name,email')
    .eq('role', 'CLIENT')
    .order('name', { ascending: true })
    .limit(200);

  const { data: locations = [] } = await sb
    .from('pt_locations')
    .select('id,name,travel_min')
    .eq('trainer_id', user.id)
    .order('name', { ascending: true });

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Calendário (PT)</h1>
      <SchedulerClient
        weekStartIso={weekStart.toISOString()}
        sessions={sessions}
        blocks={blocks}
        clients={clients as any}
        locations={locations as any}
      />
    </div>
  );
}
