import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const body = await _req.json().catch(() => ({}));
  const update = {
    name: body?.name ?? undefined,
    muscle: body?.muscle ?? undefined,
    equipment: body?.equipment ?? undefined,
  };

  const { error } = await sb.from('exercises').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
