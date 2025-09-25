import KpiCard from '@/components/ui/KpiCard';
import TaskListCard from '@/components/dashboard/TaskListCard';
import PTAgendaCard, { PTSess } from '@/components/dashboard/PTAgendaCard';
import { createServerClient } from '@/lib/supabaseServer';

export default async function PTDashboardPage() {
  const sb = createServerClient();

  let sessions: PTSess[] = [];
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date();   end.setHours(23,59,59,999);

      // join simples para obter nome do cliente (assumindo tabela profiles)
      const { data, error } = await sb
        .from('sessions')
        .select('id, title, start_at, end_at, kind, status, client:profiles!sessions_client_id_fkey(full_name)')
        .eq('trainer_id', user.id)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('start_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        sessions = data.map((d: any) => ({
          id: String(d.id),
          title: d.title ?? 'Sessão',
          client: d.client?.full_name ?? null,
          start_at: d.start_at,
          end_at: d.end_at ?? null,
          kind: d.kind ?? null,
          status: d.status ?? null,
        }));
      }
    }
  } catch {}

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Clientes ativos" value={23} delta={2.4} sparkData={[18,19,19,20,21,22,23]} />
        <KpiCard title="Sessões esta semana" value={31} delta={-3.1} sparkData={[36,35,34,33,32,31,31]} />
        <KpiCard title="Planos em rascunho" value={5} />
        <KpiCard title="Feedbacks pendentes" value={7} />
      </div>

      <PTAgendaCard sessions={sessions} />

      <div className="flex gap-2">
        <a href="/dashboard/pt/sessions/new" className="btn">➕ Marcar sessão</a>
        <a href="/dashboard/pt/sessions" className="btn">📅 Ver todas</a>
      </div>

      <TaskListCard
        storageId="pt.tasks.today"
        title="Tarefas do dia (PT)"
        items={[
          'Rever plano do próximo cliente',
          'Confirmar horários desta semana',
          'Dar feedback a clientes (últimos treinos)',
        ]}
      />
    </div>
  );
}
