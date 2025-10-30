import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { notifyPlanUpdated } from '@/lib/notify';

type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

type Body = {
  title?: string;
  clientId?: string | null;
  status?: PlanStatus;
  notifyClient?: boolean;
  notifyMessage?: string | null;
};

const PLAN_STATUSES: readonly PlanStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];
const NOTIFY_MAX_CHARS = 500;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string } | null;
  if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select('id, title, status, trainer_id, client_id')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const role = toAppRole((user as any).role) ?? 'CLIENT';
  if (role !== 'ADMIN' && data.trainer_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, plan: data });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string } | null;
  if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const sb = createServerClient();

  // garantir que o utilizador pode editar este plano
  const { data: plan, error: planError } = await sb
    .from('training_plans')
    .select('id, title, status, trainer_id, client_id')
    .eq('id', id)
    .maybeSingle();

  if (planError) {
    return NextResponse.json({ ok: false, error: planError.message }, { status: 500 });
  }
  if (!plan) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  if (role !== 'ADMIN' && plan.trainer_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  const shouldNotify = payload.notifyClient === true;
  const notifyMessageRaw =
    typeof payload.notifyMessage === 'string' ? payload.notifyMessage.trim() : '';

  if (notifyMessageRaw.length > NOTIFY_MAX_CHARS) {
    return NextResponse.json(
      {
        ok: false,
        error: `Mensagem demasiado longa (máximo ${NOTIFY_MAX_CHARS} caracteres).`,
      },
      { status: 400 }
    );
  }

  if (typeof payload.title === 'string') {
    const trimmed = payload.title.trim();
    if (trimmed.length < 3) {
      return NextResponse.json(
        { ok: false, error: 'Título demasiado curto (mínimo 3 caracteres).' },
        { status: 400 }
      );
    }
    if (trimmed !== plan.title) {
      updates.title = trimmed;
    }
  }

  if (payload.status) {
    if (!PLAN_STATUSES.includes(payload.status)) {
      return NextResponse.json({ ok: false, error: 'Estado inválido.' }, { status: 400 });
    }
    if (payload.status !== plan.status) {
      updates.status = payload.status;
    }
  }

  let nextClientId: string | null | undefined;
  if (payload.clientId !== undefined) {
    if (payload.clientId === null) {
      nextClientId = null;
    } else if (typeof payload.clientId === 'string' && payload.clientId.trim().length > 0) {
      nextClientId = payload.clientId.trim();
    } else {
      nextClientId = null;
    }

    if (nextClientId !== plan.client_id) {
      updates.client_id = nextClientId;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nenhuma alteração detetada.' }, { status: 400 });
  }

  const effectiveClientId =
    nextClientId !== undefined ? nextClientId : (plan.client_id as string | null);

  if (shouldNotify && !effectiveClientId) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Atribui um cliente ao plano antes de enviar notificações.',
      },
      { status: 400 }
    );
  }

  const { data: updatedPlan, error: updateError } = await sb
    .from('training_plans')
    .update(updates)
    .eq('id', id)
    .select('client_id')
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  const finalClientId =
    nextClientId !== undefined
      ? nextClientId
      : (updatedPlan?.client_id as string | null | undefined) ?? plan.client_id;

  if (shouldNotify && finalClientId) {
    const result = await notifyPlanUpdated(
      sb,
      finalClientId,
      id,
      notifyMessageRaw || undefined
    );
    if (!result.ok && 'reason' in result) {
      console.error('[notify-plan-updated] failed', result.reason);
    }
  }

  if (shouldNotify && plan.client_id) {
    const result = await notifyPlanUpdated(
      sb,
      plan.client_id,
      id,
      notifyMessage || undefined
    );
    if (result.ok === false) {
      console.error('[notify-plan-updated] failed', result.reason);
    }
  }

  return NextResponse.json({ ok: true, id });
}
