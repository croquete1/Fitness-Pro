export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isAdmin, isPT, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Card, { CardContent } from '@/components/ui/Card';
// 👇 importa o tipo DayWithExercises diretamente do editor
import PlanEditorDnD, {
  type DayWithExercises as EditorDay,
} from '@/components/plan/PlanEditorDnD';

type PlanRow = {
  id: string;
  title: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  client_id: string | null;
  trainer_id: string | null;
};

type DayRow = { id: string; plan_id: string; day_index: number; title: string | null };
type ItemRow = {
  id: string;
  day_id: string;
  idx: number;
  exercise_id: string | null;
  title: string | null;
  sets: number | null;
  reps: string | null;
  rest_sec: number | null;
  notes: string | null;
};

export default async function PTPlanEditPage({ params }: { params: { id: string } }) {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.id) redirect('/login');

  const role = (toAppRole(sessionUser.role) ?? 'CLIENT') as AppRole;
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();

  // 1) Plano
  const { data: plan, error: planErr } = await sb
    .from('training_plans')
    .select('id,title,status,client_id,trainer_id')
    .eq('id', params.id)
    .maybeSingle();

  if (planErr || !plan) return notFound();

  // Se for PT, tem de ser dono
  if (isPT(role) && plan.trainer_id && plan.trainer_id !== String(sessionUser.id)) {
    redirect('/dashboard/pt/plans');
  }

  // 2) Dias e exercícios
  const { data: daysRaw } = await sb
    .from('plan_days')
    .select('id,plan_id,day_index,title')
    .eq('plan_id', plan.id)
    .order('day_index', { ascending: true });

  const dayIds = (daysRaw ?? []).map((d: DayRow) => d.id);

  const { data: itemsRaw } = dayIds.length
    ? await sb
        .from('plan_exercises')
        .select('id,day_id,idx,exercise_id,title,sets,reps,rest_sec,notes')
        .in('day_id', dayIds)
        .order('idx', { ascending: true })
    : { data: [] as ItemRow[] };

  // 3) Adaptar para o tipo esperado pelo PlanEditorDnD (dayId + exercises)
  const initialDays: EditorDay[] = (daysRaw ?? []).map((d: DayRow) => ({
    dayId: d.id,
    dayIndex: d.day_index,        // se o tipo do editor não exigir, é ignorado
    title: d.title ?? null,
    exercises: (itemsRaw ?? [])
      .filter((it: ItemRow) => it.day_id === d.id)
      .sort((a, b) => a.idx - b.idx)
      .map((it: ItemRow) => ({
        id: it.id,
        dayId: it.day_id,
        idx: it.idx,
        exerciseId: it.exercise_id,
        title: it.title,
        sets: it.sets,
        reps: it.reps,
        restSec: it.rest_sec,
        notes: it.notes,
      })),
  })) as unknown as EditorDay[]; // cast seguro: só ajusta naming (dayId/exercises)

  const status = (plan.status ?? 'DRAFT') as NonNullable<PlanRow['status']>;

  return (
    <main className="p-4 md:p-6 space-y-4">
      <PageHeader
        title={plan.title ?? 'Editar plano'}
        subtitle={
          <>
            Plano #{String(plan.id).slice(0, 8)}{' '}
            <Badge variant={status === 'ACTIVE' ? 'success' : status === 'ARCHIVED' ? 'neutral' : 'warning'}>
              {status}
            </Badge>
          </>
        }
      />
      <Card>
        <CardContent className="space-y-4">
          <PlanEditorDnD
            planId={plan.id}
            initialTitle={plan.title ?? ''}
            initialStatus={status}
            initialDays={initialDays}
            className="w-full"
          />
        </CardContent>
      </Card>
    </main>
  );
}