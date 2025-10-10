import { NextResponse } from 'next/server';
import { z } from 'zod';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { getTrainerId } from '@/lib/auth/getTrainerId';

const PatchSchema = z.object({
  client_id: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(['scheduled','done','cancelled']).optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { trainerId, reason } = await getTrainerId();
  if (!trainerId) {
    if (reason === 'SUPABASE_OFFLINE') {
      return supabaseFallbackJson({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
    }
    const code = reason === 'NO_SESSION' ? 401 : 403;
    return NextResponse.json({ error: reason }, { status: code });
  }

  const sb = await tryGetSBC();
  if (!sb) {
    return supabaseFallbackJson({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
  }
  const patch = PatchSchema.parse(await req.json());

  const { error } = await sb.from('sessions')
    .update(patch)
    .eq('id', id)
    .eq('trainer_id', trainerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { trainerId, reason } = await getTrainerId();
  if (!trainerId) {
    if (reason === 'SUPABASE_OFFLINE') {
      return supabaseFallbackJson({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
    }
    const code = reason === 'NO_SESSION' ? 401 : 403;
    return NextResponse.json({ error: reason }, { status: code });
  }

  const sb = await tryGetSBC();
  if (!sb) {
    return supabaseFallbackJson({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
  }
  const { error } = await sb.from('sessions')
    .delete()
    .eq('id', id)
    .eq('trainer_id', trainerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
