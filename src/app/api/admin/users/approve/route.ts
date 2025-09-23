// src/app/api/admin/users/approve/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { touchUsers, touchProfiles } from '@/lib/revalidate';
import { toAppRole } from '@/lib/roles';

type Body = {
  id: string;
  approve?: boolean;
  role?: 'ADMIN' | 'TRAINER' | 'CLIENT' | 'PT';
  status?: string; // 'ACTIVE' | 'PENDING' | etc.
};

export async function POST(req: Request) {
  const sb = createServerClient();

  // Auth atual
  const { data: auth } = await sb.auth.getUser();
  const me = auth?.user;
  if (!me?.id) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  // Verificar se o atual é ADMIN
  let myRole: string | null = null;
  {
    const { data: u } = await sb.from('users').select('role').eq('id', me.id).maybeSingle();
    myRole = (u?.role as string) ?? null;
    if (!myRole) {
      const { data: p } = await sb.from('profiles').select('role').eq('id', me.id).maybeSingle();
      myRole = (p?.role as string) ?? null;
    }
  }
  const appRole = toAppRole(myRole);
  if (appRole !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  // Body
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }
  if (!body?.id) {
    return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });
  }

  const approve = body.approve ?? true;
  const targetRole = body.role ? (body.role === 'PT' ? 'TRAINER' : body.role) : undefined;
  const patch: Record<string, any> = {};
  if (typeof approve === 'boolean') patch.approved = approve;
  if (targetRole) patch.role = targetRole;
  if (body.status) patch.status = body.status;

  // Tenta em users; se não houver linha, faz fallback para profiles
  let updated = false;
  if (Object.keys(patch).length) {
    const { error, data } = await sb.from('users').update(patch).eq('id', body.id).select('id').maybeSingle();
    if (!error && data?.id) {
      updated = true;
    } else {
      const { error: e2, data: d2 } = await sb.from('profiles').update(patch).eq('id', body.id).select('id').maybeSingle();
      if (!e2 && d2?.id) {
        updated = true;
      } else if (error && e2) {
        return NextResponse.json({ ok: false, error: error.message || e2.message }, { status: 400 });
      }
    }
  }

  if (updated) {
    // Revalida dashboards/metricas relacionadas
    touchUsers();
    touchProfiles();
  }

  return NextResponse.json({ ok: true, id: body.id, updated, patch });
}
