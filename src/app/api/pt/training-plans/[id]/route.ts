// src/app/api/pt/training-plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { appendPlanHistory, writeEvent } from '@/lib/events';

type UpdateNotesBody = {
  action: 'update_notes';
  privateNotes?: string | null;
  publicNotes?: string | null;
  private_notes?: string | null;
  public_notes?: string | null;
};

type Body =
  | { action: 'update_day_note'; day_id: string; note: string }
  | { action: 'rename_plan'; title: string }
  | { action: 'change_status'; status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' }
  | { action: 'reorder_days'; order: string[] }
  | { action: 'reorder_exercises'; day_id: string; order: string[] }
  | UpdateNotesBody;

type Ctx = { params: Promise<{ id: string }> };

function normaliseString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function recordPlanChange(options: {
  planId: string;
  trainerId: string | null;
  clientId: string | null;
  actorId: string;
  text: string;
  extra?: Record<string, unknown>;
}) {
  const { planId, trainerId, clientId, actorId, text, extra } = options;
  await appendPlanHistory(planId, {
    kind: 'PLAN_UPDATED',
    text,
    by: actorId,
    extra,
  });

  await writeEvent({
    type: 'PLAN_UPDATED',
    actorId,
    trainerId,
    userId: clientId,
    planId,
    meta: { description: text, ...(extra ?? {}) },
  });
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { id: planId } = await ctx.params;
  const sb = createServerClient();

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { data: plan, error: planError } = await sb
    .from('training_plans' as const)
    .select('id, trainer_id, client_id, title, status')
    .eq('id', planId)
    .maybeSingle();

  if (planError) {
    return NextResponse.json({ ok: false, error: planError.message }, { status: 500 });
  }
  if (!plan) {
    return NextResponse.json({ ok: false, error: 'plan_not_found' }, { status: 404 });
  }

  if (role === 'PT' && plan.trainer_id && plan.trainer_id !== me.id) {
    return NextResponse.json({ ok: false, error: 'plan_forbidden' }, { status: 403 });
  }

  const trainerId = plan.trainer_id ?? me.id;
  const clientId = plan.client_id ?? null;
  const nowIso = new Date().toISOString();

  try {
    // Renomear plano
    if (body.action === 'rename_plan') {
      const newTitle = normaliseString((body as { title: string }).title);
      if (!newTitle) {
        return NextResponse.json({ ok: false, error: 'missing_title' }, { status: 400 });
      }
      const { error } = await sb
        .from('training_plans' as const)
        .update({ title: newTitle, updated_at: nowIso })
        .eq('id', planId);
      if (error) throw new Error(error.message);
      await recordPlanChange({
        planId,
        trainerId,
        clientId,
        actorId: me.id,
        text: 'Título do plano atualizado.',
        extra: { title: newTitle },
      });
      return NextResponse.json({ ok: true });
    }

    // Alterar estado
    if (body.action === 'change_status') {
      const allowed: Array<'DRAFT' | 'ACTIVE' | 'ARCHIVED'> = ['DRAFT', 'ACTIVE', 'ARCHIVED'];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 400 });
      }
      const { error } = await sb
        .from('training_plans' as const)
        .update({ status: body.status, updated_at: nowIso })
        .eq('id', planId);
      if (error) throw new Error(error.message);
      await recordPlanChange({
        planId,
        trainerId,
        clientId,
        actorId: me.id,
        text: 'Estado do plano atualizado.',
        extra: { status: body.status },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'update_notes') {
      const privateNotes = body.privateNotes ?? body.private_notes;
      const publicNotes = body.publicNotes ?? body.public_notes;

      if (typeof privateNotes === 'undefined' && typeof publicNotes === 'undefined') {
        return NextResponse.json({ ok: false, error: 'empty_update' }, { status: 400 });
      }

      const updates: Record<string, string | null> = { updated_at: nowIso } as any;
      if (typeof privateNotes !== 'undefined') {
        const normalised = normaliseString(privateNotes);
        updates.private_notes = normalised;
        updates.notes = normalised;
      }
      if (typeof publicNotes !== 'undefined') {
        updates.public_notes = normaliseString(publicNotes);
      }

      const { error } = await sb
        .from('training_plans' as const)
        .update(updates)
        .eq('id', planId);
      if (error) throw new Error(error.message);

      await recordPlanChange({
        planId,
        trainerId,
        clientId,
        actorId: me.id,
        text: 'Notas do plano atualizadas.',
        extra: {
          hasPrivateNotes: Boolean(updates.private_notes),
          hasPublicNotes: Boolean(updates.public_notes),
        },
      });

      return NextResponse.json({ ok: true });
    }

    // Reordenar dias
    if (body.action === 'reorder_days') {
      // order = array de IDs de plan_days na nova ordem (0..n)
      // atualizamos o campo sort_index por lote
      const updates = body.order.map((dayId, idx) => ({
        id: dayId,
        sort_index: idx,
      }));

      // Atualização uma-a-uma para manter compatibilidade com PostgREST
      for (const u of updates) {
        const { error } = await sb
          .from('plan_days' as const)
          .update({ sort_index: u.sort_index })
          .eq('id', u.id)
          .eq('plan_id', planId);
        if (error) throw new Error(error.message);
      }

      await sb.from('training_plans' as const).update({ updated_at: nowIso }).eq('id', planId);
      return NextResponse.json({ ok: true });
    }

    // Reordenar exercícios dentro de um dia
    if (body.action === 'reorder_exercises') {
      const updates = body.order.map((exId, idx) => ({
        id: exId,
        sort_index: idx,
      }));

      for (const u of updates) {
        const { error } = await sb
          .from('plan_exercises' as const)
          .update({ sort_index: u.sort_index })
          .eq('id', u.id)
          .eq('plan_id', planId)
          .eq('day_id', body.day_id);
        if (error) throw new Error(error.message);
      }

      await sb.from('training_plans' as const).update({ updated_at: nowIso }).eq('id', planId);
      return NextResponse.json({ ok: true });
    }

    // Atualizar notas do dia do plano
    if (body.action === 'update_day_note') {
      const note = normaliseString(body.note);
      const { error } = await sb
        .from('plan_days' as const)
        .update({ notes: note })
        .eq('id', body.day_id)
        .eq('plan_id', planId);

      if (error) throw new Error(error.message);

      await sb.from('training_plans' as const).update({ updated_at: nowIso }).eq('id', planId);

      await recordPlanChange({
        planId,
        trainerId,
        clientId,
        actorId: me.id,
        text: 'Notas do dia do plano atualizadas.',
        extra: { dayId: body.day_id },
      });

      return NextResponse.json({ ok: true });
    }

    // Ação desconhecida
    return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'unexpected_error' },
      { status: 500 }
    );
  }
}
