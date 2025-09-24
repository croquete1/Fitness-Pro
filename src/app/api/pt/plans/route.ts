// src/app/api/pt/plans/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  const { data, error } = await sb.from('training_plans')
    .select('id,title,status,start_date,end_date,client_id')
    .eq('trainer_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });

  return NextResponse.json({ ok:true, items: data ?? [] });
}

export async function POST(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  let body:any; try { body = await req.json(); } catch {
    return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 });
  }
  if (!body?.client_id || !body?.title) {
    return NextResponse.json({ ok:false, error:'MISSING_FIELDS' }, { status:400 });
  }

  const row = {
    client_id: body.client_id,
    trainer_id: auth.user.id,
    title: String(body.title),
    status: body.status ?? 'ATIVO',
    start_date: body.start_date ? new Date(body.start_date).toISOString() : null,
    end_date: body.end_date ? new Date(body.end_date).toISOString() : null,
  };

  const { data, error } = await sb.from('training_plans').insert(row).select('id').single();
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });

  return NextResponse.json({ ok:true, id: data?.id });
}
