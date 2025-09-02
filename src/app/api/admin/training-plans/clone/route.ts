// src/app/api/admin/training-plans/clone/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });
  if (toAppRole(user.role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = await req.json().catch(() => ({}));
  const planId = String(body?.planId ?? '');
  if (!planId) return new NextResponse('Bad Request: planId', { status: 400 });

  const supabase = createServerClient();

  // 1) Buscar plano original
  const { data: original, error: e1 } = await supabase
    .from('training_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (e1 || !original) return new NextResponse('Not Found', { status: 404 });

  // 2) Criar cópia
  const cloneName =
    (body?.newName as string)?.trim() || `${original.name || 'Plano'} (cópia)`;
  const ownerTrainerId = (body?.trainerId as string) || null;

  const { data: clone, error: e2 } = await supabase
    .from('training_plans')
    .insert({
      name: cloneName,
      description: original.description ?? null,
      tags: original.tags ?? null,
      created_by: user.id,
      owner_trainer_id: ownerTrainerId, // opcional na tua tabela
      is_published: false,
    })
    .select()
    .single();

  if (e2 || !clone) return new NextResponse(e2?.message || 'Insert failed', { status: 500 });

  // 3) (Opcional) Copiar exercícios do plano por função SQL/RPC
  // Se tiveres uma função: create function clone_plan_exercises(src_plan_id uuid, dst_plan_id uuid) ...
  // Ignoramos o erro para não falhar build se não existir.
  try {
    await supabase.rpc('clone_plan_exercises', {
      src_plan_id: planId,
      dst_plan_id: clone.id,
    });
  } catch {}

  await logAudit({
    actorId: user.id,
    kind: 'TRAINING_PLAN_CLONE',
    message: 'Clonagem de plano de treino',
    targetType: 'TRAINING_PLAN',
    targetId: clone.id,
    diff: { from: planId, to: clone.id },
  });

  return NextResponse.json(clone);
}