import WeekCalendar from '@/components/pt/WeekCalendar';
import { createServerClient } from '@/lib/supabaseServer';

export default async function PTSessionsCalendarPage() {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const start = new Date(); // semana atual no client (o componente ajusta)
  start.setHours(0,0,0,0);

  // carrega próximas 2 semanas para navegação inicial
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  end.setHours(23,59,59,999);

  const { data, error } = await sb
    .from('sessions')
    .select('id, title, start_at, end_at, kind, status, client:profiles!sessions_client_id_fkey(full_name)')
    .eq('trainer_id', user.id)
    .gte('start_at', start.toISOString())
    .lte('start_at', end.toISOString());

  const sessions = (!error && Array.isArray(data) ? data : []) as any[];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Calendário 🗓️</h1>
      <WeekCalendar initialSessions={sessions} />
    </div>
  );
}
