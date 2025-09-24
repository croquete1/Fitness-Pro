import KpiCard from '@/components/ui/KpiCard';
import TaskListCard from '@/components/dashboard/TaskListCard';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Utilizadores" value={128} delta={3.2} sparkData={[110,112,114,118,121,124,128]} />
        <KpiCard title="Planos ativos" value={64} delta={-1.8} sparkData={[70,69,68,67,66,65,64]} />
        <KpiCard title="Novos registos" value={12} delta={5.0} sparkData={[6,7,8,9,10,11,12]} />
        <KpiCard title="Erros sistema" value={0} delta={0} />
      </div>

      <TaskListCard
        storageId="admin.tasks.today"
        title="Tarefas de Administração"
        items={[
          'Rever pedidos de aprovação',
          'Validar backups e logs',
          'Criar contas para novos PTs',
        ]}
      />
    </div>
  );
}
