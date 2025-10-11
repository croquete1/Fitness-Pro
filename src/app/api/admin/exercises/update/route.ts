import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const { id, patch } = await req.json();
  if (!id || !patch) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const sb = createServerClient();
  const updatePayload = { ...patch, updated_at: new Date().toISOString() };
  const { error } = await sb.from('exercises').update(updatePayload).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
