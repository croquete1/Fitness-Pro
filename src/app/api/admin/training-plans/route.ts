// src/app/api/admin/training-plans/route.ts
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
  const name = (body?.name ?? '').trim();
  if (!name) return new NextResponse('Bad Request: name', { status: 400 });

  const description = (body?.description ?? null) as string | null;
  const tags = Array.isArray(body?.tags) ? body.tags : null;
  const publish = !!body?.publish;

  const supabase = createServerClient();

  // Ajusta nomes/colunas à tua tabela real `training_plans`
  const { data, error } = await supabase
    .from('training_plans')
    .insert({
      name,
      description,
      tags,
      created_by: user.id,
      is_published: publish,
    })
    .select()
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });

  await logAudit({
    actorId: user.id,
    kind: 'TRAINING_PLAN_CREATE',
    message: 'Criação de plano de treino',
    targetType: 'TRAINING_PLAN',
    targetId: data?.id ?? null,
    diff: { after: data },
  });

  return NextResponse.json(data ?? { ok: true });
}