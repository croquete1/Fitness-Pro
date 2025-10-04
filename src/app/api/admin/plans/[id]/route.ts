import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const update = { title: body?.title ?? undefined };

  const { error } = await sb.from('training_plans').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
