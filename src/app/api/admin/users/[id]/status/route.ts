// src/app/api/admin/users/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Body = {
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'; // ajusta se tiveres mais estados
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Autenticação
  const me = await getSessionUserSafe();
  if (!me?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Autorização: apenas ADMIN
  const role = toAppRole(me.role);
  if (role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Body
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body?.status || !['ACTIVE', 'SUSPENDED', 'PENDING'].includes(body.status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const userId = params.id;
  const sb = createServerClient();

  const { data, error } = await sb
    .from('users')
    .update({ status: body.status })
    .eq('id', userId)
    .select('id, status')
    .single();

  if (error) {
    // Se precisares de distinguir 404, podes inspecionar error.details / error.code
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id, status: data.status });
}
