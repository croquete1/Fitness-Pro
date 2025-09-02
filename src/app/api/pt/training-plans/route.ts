// src/app/api/pt/training-plans/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';

/** Criação de plano de treino por PT (ou Admin). */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((user as any).role);
  if (role !== 'TRAINER' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    clientId?: string;
    title?: string;
    notes?: string | null;
    blocks?: any[]; // estrutura livre para os exercícios/blocos
    isTemplate?: boolean;
  };

  const clientId = String(body.clientId ?? '').trim();
  const title = String(body.title ?? '').trim();
  if (!clientId || !title) {
    return new NextResponse('Bad Request: clientId e title são obrigatórios', { status: 400 });
  }

  const supabase = createServerClient();

  // Opcional: validar que o PT tem vínculo ao cliente (se não for ADMIN)
  if (role === 'TRAINER') {
    const { data: link, error: linkErr } = await supabase
      .from('trainer_clients')
      .select('id')
      .eq('trainer_id', user.id)
      .eq('client_id', clientId)
      .maybeSingle();

    if (linkErr) {
      console.error('[training-plans POST] link check error', linkErr);
      return new NextResponse('Erro ao validar vínculo PT/cliente', { status: 500 });
    }
    if (!link) {
      return new NextResponse('Forbidden: PT sem vínculo a este cliente', { status: 403 });
    }
  }

  // Inserção do plano
  const payload = {
    client_id: clientId,
    trainer_id: user.id,
    title,
    notes: body.notes ?? null,
    blocks: Array.isArray(body.blocks) ? body.blocks : [],
    is_template: !!body.isTemplate,
    created_by: user.id,
  };

  const { data: plan, error: insErr } = await supabase
    .from('training_plans')
    .insert(payload)
    .select('id, client_id, trainer_id, title')
    .single();

  if (insErr || !plan) {
    console.error('[training-plans POST] insert error', insErr);
    return new NextResponse('Falha ao criar plano', { status: 500 });
  }

  // AUDIT — usar literais suportados:
  // kind: escolhemos um já existente para evitar conflitos de enum
  // targetType: **TEM** de ser 'TRAINING_PLAN' (e não 'TrainingPlan')
  await logAudit({
    actorId: user.id,
    kind: 'ACCOUNT_STATUS_CHANGE',
    message: 'PLAN_CREATE',
    targetType: 'TRAINING_PLAN', // << correção aqui
    targetId: String(plan.id),
    diff: { clientId: plan.client_id, trainerId: plan.trainer_id, title: plan.title },
  });

  return NextResponse.json(plan, { status: 201 });
}

/** (Opcional) Lista os planos do PT autenticado (ou filtra por cliente com ?client=). */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((user as any).role);
  if (role !== 'TRAINER' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const client = url.searchParams.get('client') ?? undefined;

  const supabase = createServerClient();

  let q = supabase
    .from('training_plans')
    .select('id, client_id, trainer_id, title, is_template, inserted_at')
    .order('inserted_at', { ascending: false })
    .limit(50);

  if (role === 'TRAINER') q = q.eq('trainer_id', user.id);
  if (client) q = q.eq('client_id', client);

  const { data, error } = await q;
  if (error) {
    console.error('[training-plans GET] fetch error', error);
    return new NextResponse('Falha a obter planos', { status: 500 });
  }

  return NextResponse.json(data ?? []);
}