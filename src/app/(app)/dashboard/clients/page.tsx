import KpiCard from '@/components/ui/KpiCard';
import TaskListCard from '@/components/dashboard/TaskListCard';

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Treinos concluídos" value={12} delta={8.3} sparkData={[4,5,6,7,9,11,12]} />
        <KpiCard title="Semanas de consistência" value={3} />
        <KpiCard title="Planos ativos" value={1} />
        <KpiCard title="Mensagens" value={2} />
      </div>

      <TaskListCard
        storageId="client.tasks.today"
        title="A fazer"
        items={[
          'Treino A - Perna/Glúteo',
          'Atualizar peso corporal',
          'Responder ao PT sobre mobilidade',
        ]}
      />
    </div>
  );
}
