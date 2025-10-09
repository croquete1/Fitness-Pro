import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSBC } from '@/lib/supabase/server';
import { getTrainerId } from '@/lib/auth/getTrainerId';
import { supabaseConfigErrorResponse } from '@/lib/supabase/responses';

const PatchSchema = z.object({
  client_id: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(['scheduled','done','cancelled']).optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { trainerId, reason } = await getTrainerId();
  if (!trainerId) {
    if (reason === 'SUPABASE_OFFLINE') {
      return NextResponse.json({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
    }
    const code = reason === 'NO_SESSION' ? 401 : 403;
    return NextResponse.json({ error: reason }, { status: code });
  }

  let sb;
  try {
    sb = getSBC();
  } catch (err) {
    const res = supabaseConfigErrorResponse(err);
    if (res) return res;
    throw err;
  }
  const patch = PatchSchema.parse(await req.json());

  const { error } = await sb.from('sessions')
    .update(patch)
    .eq('id', params.id)
    .eq('trainer_id', trainerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { trainerId, reason } = await getTrainerId();
  if (!trainerId) {
    if (reason === 'SUPABASE_OFFLINE') {
      return NextResponse.json({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
    }
    const code = reason === 'NO_SESSION' ? 401 : 403;
    return NextResponse.json({ error: reason }, { status: code });
  }

  let sb;
  try {
    sb = getSBC();
  } catch (err) {
    const res = supabaseConfigErrorResponse(err);
    if (res) return res;
    throw err;
  }
  const { error } = await sb.from('sessions')
    .delete()
    .eq('id', params.id)
    .eq('trainer_id', trainerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
