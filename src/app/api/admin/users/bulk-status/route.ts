// src/app/api/admin/users/bulk-status/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Body = {
  ids: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'; // acrescenta aqui outros estados se existirem
};

export async function PATCH(req: Request): Promise<NextResponse> {
  // Autenticação
  const me = await getSessionUserSafe();
  if (!me?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Autorização (apenas ADMIN)
  const role = toAppRole(me.role);
  if (role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Ler e validar body
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const allowed = ['ACTIVE', 'SUSPENDED', 'PENDING'] as const;
  if (!body?.status || !allowed.includes(body.status as (typeof allowed)[number])) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'ids_required' }, { status: 400 });
  }

  // (Opcional) limitar tamanho do batch
  if (body.ids.length > 1000) {
    return NextResponse.json({ error: 'too_many_ids' }, { status: 400 });
  }

  // Atualização em bulk via Supabase
  const sb = createServerClient();
  const { data, error } = await sb
    .from('users')
    .update({ status: body.status })
    .in('id', body.ids)
    .select('id, status');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    updatedCount: data?.length ?? 0,
    status: body.status,
  });
}
