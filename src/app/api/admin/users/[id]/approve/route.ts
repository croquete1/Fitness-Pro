import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(
  _req: Request,
  ctx: Ctx
): Promise<NextResponse> {
  // Autenticação
  const me = await getSessionUserSafe();
  if (!me?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Autorização
  const role = toAppRole(me.role);
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id: userId } = await ctx.params;
  const sb = createServerClient();

  // Aprovar utilizador (status -> ACTIVE)
  const { data, error } = await sb
    .from('users')
    .update({ status: 'ACTIVE' })
    .eq('id', userId)
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // (Opcional) Se tiveres colunas de auditoria, descomenta:
  // await sb.from('audit_logs').insert({
  //   actor_id: me.id,
  //   kind: 'USER_APPROVED',
  //   payload: { approved_user_id: userId },
  // });

  return NextResponse.json({ ok: true, id: data.id });
}
