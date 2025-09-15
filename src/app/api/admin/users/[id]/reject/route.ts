import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
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

  const userId = params.id;
  const sb = createServerClient();

  // (Opcional) receber motivo do body, útil para auditoria
  // Não persisto em 'users' para evitar erros se a coluna não existir.
  // const { reason } = await req.json().catch(() => ({ reason: null as string | null }));

  // Atualiza estado do utilizador
  // Troca para 'REJECTED' aqui se existir no teu schema.
  const newStatus = 'SUSPENDED';

  const { data, error } = await sb
    .from('users')
    .update({ status: newStatus })
    .eq('id', userId)
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // (Opcional) Auditoria
  // await sb.from('audit_logs').insert({
  //   actor_id: me.id,
  //   kind: 'USER_REJECTED',
  //   payload: { rejected_user_id: userId, reason },
  // });

  return NextResponse.json({ ok: true, id: data.id, status: newStatus });
}
