// src/app/api/logs/day-note/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status: 401 });

  let body:any; try{ body=await req.json(); }catch{ return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }
  if (!body?.plan_id || typeof body.day_index !== 'number') return NextResponse.json({ ok:false, error:'MISSING_FIELDS' }, { status:400 });

  const row = { user_id: auth.user.id, plan_id: body.plan_id, day_index: body.day_index, note: String(body.note ?? '') };

  try {
    const { error } = await sb.from('workout_notes' as any).insert(row);
    if (error && !/does not exist/i.test(error.message)) {
      return NextResponse.json({ ok:false, error:error.message }, { status:400 });
    }
  } catch {}
  return NextResponse.json({ ok:true });
}
