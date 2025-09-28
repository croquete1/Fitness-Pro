import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const { id, patch } = await req.json();
  if (!id || !patch) return NextResponse.json({ error: 'bad request' }, { status: 400 });

  const sb = getSupabaseServer();
  const { error } = await sb.from('users' as any).update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
