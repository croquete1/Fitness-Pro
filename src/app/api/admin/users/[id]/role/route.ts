// src/app/api/admin/users/[id]/role/route.ts
import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole, appRoleToDbRole } from '@/lib/roles';
import { touchUsers } from '@/lib/revalidate';
import { getUserRole } from '@/lib/userRepo';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params?.id;
  if (!id) return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, error: 'SUPABASE_UNCONFIGURED' },
      { status: 503 }
    );
  }
  const { data: meAuth } = await sb.auth.getUser();
  if (!meAuth?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  // só ADMIN pode mudar roles
  const myRole = await getUserRole(meAuth.user.id, { client: sb });
  if (toAppRole(myRole) !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  // novo role (apenas CLIENT ou PT)
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 }); }
  const nextAppRole = toAppRole(body?.role);
  if (!nextAppRole || (nextAppRole !== 'CLIENT' && nextAppRole !== 'PT')) {
    return NextResponse.json({ ok: false, error: 'ROLE_NOT_ALLOWED' }, { status: 400 });
  }

  // não permitir des/promover ADMIN por aqui
  const { data: targetUser } =
    await sb.from('users').select('role').eq('id', id).maybeSingle();
  const currentAppRole = toAppRole(targetUser?.role) ?? null;
  if (currentAppRole === 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'ADMIN_LOCKED' }, { status: 409 });
  }

  // gravar em users
  const dbRole = appRoleToDbRole(nextAppRole) ?? 'TRAINER';
  const { error } = await sb.from('users').update({ role: dbRole }).eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  await logAudit(sb, {
    kind: AUDIT_KINDS.USER_UPDATE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: id,
    actor_id: meAuth.user.id,
    note: `Role alterado para ${nextAppRole}`,
  });

  void touchUsers();

  return NextResponse.json({ ok: true, id, role: nextAppRole });
}
