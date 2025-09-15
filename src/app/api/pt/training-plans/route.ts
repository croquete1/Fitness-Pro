// src/app/api/pt/training-plans/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Body = {
  client_id: string;
  title?: string | null;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
};

export async function POST(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!body?.client_id) {
    return NextResponse.json({ ok: false, error: 'missing_client_id' }, { status: 400 });
  }

  const sb = createServerClient();

  try {
    // Criar plano e devolver o id
    const { data, error } = await sb
      .from('training_plans' as const)
      .insert({
        client_id: body.client_id,
        trainer_id: me.id,
        title: body.title ?? null,
        status: body.status ?? 'DRAFT',
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    const planId = data.id as string;

    // Notificações “best effort”: cliente e treinador
    try {
      const nowIso = new Date().toISOString();
      await sb.from('notifications' as const).insert([
        {
          user_id: body.client_id, // cliente notificado que tem novo plano
          type: 'TRAINING_PLAN_CREATED',
          payload: { plan_id: planId, trainer_id: me.id, client_id: body.client_id },
          read: false,
          created_at: nowIso,
        } as any,
        {
          user_id: me.id, // o PT também recebe log/eco
          type: 'TRAINING_PLAN_CREATED',
          payload: { plan_id: planId, trainer_id: me.id, client_id: body.client_id },
          read: false,
          created_at: nowIso,
        } as any,
      ]);
    } catch {
      // não bloquear o POST se o centro de notificações falhar
    }

    return NextResponse.json({ ok: true, id: planId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'unexpected_error' },
      { status: 500 },
    );
  }
}
