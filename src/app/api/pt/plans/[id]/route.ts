// src/app/api/pt/plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  let body:any; try { body = await _.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }

  const patch: any = {};
  if ('title' in body) patch.title = String(body.title ?? '');
  if ('status' in body) patch.status = String(body.status ?? 'ATIVO');
  if ('start_date' in body) patch.start_date = body.start_date ? new Date(body.start_date).toISOString() : null;
  if ('end_date' in body) patch.end_date = body.end_date ? new Date(body.end_date).toISOString() : null;

  const { error } = await sb.from('training_plans')
    .update(patch)
    .eq('id', params.id)
    .eq('trainer_id', auth.user.id);
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });

  return NextResponse.json({ ok:true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  const { error } = await sb.from('training_plans')
    .delete()
    .eq('id', params.id)
    .eq('trainer_id', auth.user.id);
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });

  return NextResponse.json({ ok:true });
}
