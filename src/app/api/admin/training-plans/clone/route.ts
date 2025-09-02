import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';
import { AuditKind } from '@prisma/client';

// Clona um plano de treino (copia registo e opções principais)
export async function POST(req: Request) {
  try {
    const me = await getSessionUser();
    if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
    if (toAppRole(me.role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

    const body = await req.json().catch(() => ({}));
    const srcId: string | null = typeof body?.id === 'string' ? body.id : null;
    const newTitle: string | null = typeof body?.title === 'string' ? body.title : null;
    const trainerId: string | null = typeof body?.trainerId === 'string' ? body.trainerId : null;

    if (!srcId) return new NextResponse('Bad Request', { status: 400 });

    const sb = createServerClient();

    const { data: src, error: readErr } = await sb
      .from('training_plans')
      .select('*')
      .eq('id', srcId)
      .single();

    if (readErr || !src) return new NextResponse('Not Found', { status: 404 });

    const payload = {
      ...src,
      id: undefined, // será gerado
      title: newTitle ?? `${src.title ?? 'Plano'} (cópia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trainer_id: trainerId ?? src.trainer_id ?? null,
      // se houver campos que não queres copiar (ex.: published, client_id, etc.), zera-os aqui
      client_id: null,
    };

    const { data: after, error: insErr } = await sb
      .from('training_plans')
      .insert(payload)
      .select('id,title,trainer_id,client_id,updated_at')
      .single();

    if (insErr || !after) return new NextResponse('DB Error', { status: 500 });

    await logAudit({
      actorId: me.id,
      kind: AuditKind.ACCOUNT_STATUS_CHANGE,
      message: 'Clonagem de plano de treino',
      targetType: 'TRAINING_PLAN',
      targetId: after.id,
      diff: { before: { id: srcId }, after },
    });

    return NextResponse.json(after);
  } catch (e) {
    console.error('[training-plans.clone] ', e);
    return new NextResponse('Server Error', { status: 500 });
  }
}