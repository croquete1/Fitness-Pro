import { NextResponse } from 'next/server';
import { z } from 'zod';
import { serverSB } from '@/lib/supabase/server';

const PatchSchema = z.object({
  trainer_id: z.string().optional(),
  client_id: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(['scheduled','done','cancelled']).optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(_req: Request, ctx: { params: { id: string } }) {
  try {
    const sb = serverSB();
    const body = await _req.json();
    const patch = PatchSchema.parse(body);

    const { error } = await sb.from('pts_sessions')
      .update(patch)
      .eq('id', ctx.params.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const sb = serverSB();
    const { error } = await sb.from('pts_sessions')
      .delete()
      .eq('id', ctx.params.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
