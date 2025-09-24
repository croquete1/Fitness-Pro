// src/app/api/admin/users/[id]/role/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, appRoleToDbRole } from '@/lib/roles';
import { touchUsers, touchProfiles } from '@/lib/revalidate';

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params?.id;
  if (!id) return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });

  const sb = createServerClient();
  const { data: meAuth } = await sb.auth.getUser();
  if (!meAuth?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  // só ADMIN pode mudar roles
  let myRole: string | null = null;
  {
    const { data: u } = await sb.from('users').select('role').eq('id', meAuth.user.id).maybeSingle();
    myRole = (u?.role as string) ?? null;
    if (!myRole) {
      const { data: p } = await sb.from('profiles').select('role').eq('id', meAuth.user.id).maybeSingle();
      myRole = (p?.role as string) ?? null;
    }
  }
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

  // gravar em users (fallback profiles)
  const dbRole = appRoleToDbRole(nextAppRole) ?? 'TRAINER';
  let updated = false;

  {
    const { data, error } =
      await sb.from('users').update({ role: dbRole }).eq('id', id).select('id').maybeSingle();
    if (!error && data?.id) updated = true;
  }
  if (!updated) {
    const { data, error } =
      await sb.from('profiles').update({ role: dbRole }).eq('id', id).select('id').maybeSingle();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    updated = !!data?.id;
  }

  // revalidar dashboards
  void touchUsers(); void touchProfiles();

  return NextResponse.json({ ok: true, id, role: nextAppRole });
}
