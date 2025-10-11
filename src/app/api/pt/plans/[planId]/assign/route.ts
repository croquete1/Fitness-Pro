import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { appendPlanHistory, upsertPlanAssignment, writeEvent } from '@/lib/events';

const PLAN_TABLES = ['training_plans', 'plans', 'programs'];
const FIELD_VARIANTS: Array<{ client: string; trainer: string }> = [
  { client: 'client_id', trainer: 'trainer_id' },
  { client: 'clientId', trainer: 'trainerId' },
  { client: 'client', trainer: 'trainer' },
  { client: 'user_id', trainer: 'trainer_id' },
];

async function updatePlanAssignment(
  planId: string,
  clientId: string | null,
  trainerId: string | null,
) {
  const sb = tryCreateServerClient();
  if (!sb) return null;

  for (const table of PLAN_TABLES) {
    for (const fields of FIELD_VARIANTS) {
      const payload: Record<string, any> = {};
      if (clientId !== undefined) payload[fields.client] = clientId;
      if (trainerId !== undefined) payload[fields.trainer] = trainerId;

      try {
        const res = await sb
          .from(table)
          .update(payload)
          .eq('id', planId)
          .select('*')
          .maybeSingle();

        if (res.error) {
          const code = res.error.code ?? '';
          if (code === '42703' || code === 'PGRST205' || code === 'PGRST301') continue;
          return { error: res.error.message };
        }

        if (res.data) {
          return { row: res.data };
        }
      } catch (error: any) {
        const code = error?.code ?? error?.message ?? '';
        if (code.includes('PGRST205') || code.includes('PGRST301') || code.includes('42703')) {
          continue;
        }
        return { error: error?.message ?? 'REQUEST_FAILED' };
      }
    }
  }

  return { row: null };
}

export async function POST(req: Request, ctx: { params: Promise<{ planId: string }> }) {
  const { planId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const clientId = body.clientId ?? null;
  const trainerId = body.trainerId ?? null;

  if (!tryCreateServerClient()) {
    return NextResponse.json({ error: 'SUPABASE_UNAVAILABLE' }, { status: 503 });
  }

  const updated = await updatePlanAssignment(planId, clientId, trainerId);
  if (updated?.error) {
    return NextResponse.json({ error: updated.error }, { status: 400 });
  }

  await upsertPlanAssignment({ planId, clientId, trainerId });
  await writeEvent({
    type: 'PLAN_ASSIGNED',
    planId,
    userId: clientId,
    trainerId,
  });
  await appendPlanHistory(planId, {
    kind: 'PLAN_ASSIGNED',
    text: 'Plano atribuído',
    by: trainerId,
    extra: { clientId },
  });

  return NextResponse.json({ ok: true, row: updated?.row ?? null });
}
