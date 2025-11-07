import TrainerPlansDashboardClient, {
  type DashboardResponse,
} from '@/components/trainer/TrainerPlansDashboardClient';

type Props = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

export default function PTPlansClient({ initialData, viewerName }: Props) {
  return (
    <TrainerPlansDashboardClient
      initialData={initialData}
      viewerName={viewerName}
      pageTitle="Os meus planos"
      pageSubtitle={
        viewerName
          ? `Resumo dos planos publicados por ${viewerName}.`
          : 'Resumo dos planos que acompanhas semanalmente.'
      }
      searchPlaceholder="Filtrar por plano, cliente ou estado"
      exportFileName="planos-pt"
    />
  );
}
