// src/app/api/pt/training-plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Body =
  | { action: 'update_day_note'; day_id: string; note: string }
  | { action: 'rename_plan'; title: string }
  | { action: 'change_status'; status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' }
  | { action: 'reorder_days'; order: string[] }
  | { action: 'reorder_exercises'; day_id: string; order: string[] };

type Ctx = { params: Promise<{ id: string }> };

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

  try {
    // Renomear plano
    if (body.action === 'rename_plan') {
      const { error } = await sb
        .from('training_plans' as const)
        .update({ title: body.title })
        .eq('id', planId);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    // Alterar estado
    if (body.action === 'change_status') {
      const { error } = await sb
        .from('training_plans' as const)
        .update({ status: body.status })
        .eq('id', planId);
      if (error) throw new Error(error.message);
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

      return NextResponse.json({ ok: true });
    }

    // Atualizar notas do dia do plano
    if (body.action === 'update_day_note') {
      const { error } = await sb
        .from('plan_days' as const)
        .update({ notes: body.note })
        .eq('id', body.day_id)
        .eq('plan_id', planId);

      if (error) throw new Error(error.message);

      // 🔔 Notificação inline (substitui notifyPlanDayNotesUpdated(...))
      // Ajusta os nomes das colunas conforme o teu schema de notifications.
      try {
        await sb.from('notifications' as const).insert({
          user_id: me.id, // quem fez a alteração
          type: 'PLAN_DAY_NOTE_UPDATED',
          payload: { plan_id: planId, day_id: body.day_id },
          read: false,
          created_at: new Date().toISOString(),
        } as any);
      } catch {
        // não bloquear a request por causa do centro de notificações
      }

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
