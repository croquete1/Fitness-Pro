import Link from 'next/link';
import TrainerPlansDashboardClient, {
  type DashboardResponse,
} from '@/components/trainer/TrainerPlansDashboardClient';

export type PlansPTClientProps = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

export default function PlansPTClient({ initialData, viewerName }: PlansPTClientProps) {
  return (
    <TrainerPlansDashboardClient
      initialData={initialData}
      viewerName={viewerName}
      pageTitle="Planos de treino"
      pageSubtitle="Gere os planos publicados e acompanha o estado de cada cliente."
      headerActions={
        <Link href="/dashboard/pt/plans/new" className="btn primary">
          + Novo plano
        </Link>
      }
      searchPlaceholder="Filtrar por plano, cliente ou estado"
      exportFileName="planos-pt-geridos"
      renderRowActions={(row) => (
        <>
          <Link href={`/dashboard/pt/plans/${row.id}`} className="btn ghost">
            Ver
          </Link>
          <Link href={`/dashboard/pt/plans/${row.id}/edit`} className="btn chip">
            Editar
          </Link>
        </>
      )}
      emptyState={{
        icon: '🗂️',
        title: 'Sem planos registados',
        description: 'Cria um plano personalizado para começares a acompanhar o progresso dos teus clientes.',
      }}
    />
  );
}
