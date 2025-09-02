// src/app/api/admin/training-plans/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((user as any).role);
  if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name: string = body?.name?.trim();
  const description: string = body?.description ?? '';
  const payload = {
    name,
    description,
    // se tiveres mais campos: exercises, visibility, etc.
  };
  if (!name) return new NextResponse('Bad Request (name)', { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('training_plans')
    .insert(payload)
    .select()
    .single();

  if (error || !data?.id) {
    console.error('[training-plans:create] supabase error', error);
    return new NextResponse('Failed to create', { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    kind: 'TRAINING_PLAN_CREATE',      // ✅ agora permitido pelo tipo
    message: 'Criação de plano de treino',
    targetType: 'TRAINING_PLAN',
    targetId: String(data.id),         // ✅ garante string
    diff: { payload },
  });

  return NextResponse.json(data);
}