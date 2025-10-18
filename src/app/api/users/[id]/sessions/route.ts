import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { assertCanViewClient } from '@/lib/acl';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

type SessionRow = {
  id: string;
  trainer_id: string;
  client_id: string;
  scheduled_at: string;
  duration_min: number;
  location: string | null;
  notes: string | null;
};

type SessionPayload = {
  id: string;
  trainerId: string | null;
  trainerName: string | null;
  scheduledAt: string;
  durationMin: number;
  location: string | null;
  notes: string | null;
};

function mapSession(row: SessionRow, trainerMap: Map<string, { name: string | null; email: string | null }>): SessionPayload {
  const trainer = trainerMap.get(row.trainer_id);
  const trainerName = trainer?.name ?? trainer?.email ?? null;
  return {
    id: row.id,
    trainerId: row.trainer_id ?? null,
    trainerName,
    scheduledAt: row.scheduled_at,
    durationMin: row.duration_min,
    location: row.location ?? null,
    notes: row.notes ?? null,
  };
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();

  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  const { data, error } = await sb
    .from('sessions')
    .select('id,trainer_id,client_id,scheduled_at,duration_min,location,notes')
    .eq('client_id', id)
    .order('scheduled_at', { ascending: false });

  if (error) {
    console.error('[client-sessions] failed to list sessions', error);
    return NextResponse.json({ error: 'failed_to_load_sessions' }, { status: 500 });
  }

  const rows = (data ?? []) as SessionRow[];
  if (!rows.length) return NextResponse.json([]);

  const trainerIds = Array.from(new Set(rows.map((row) => row.trainer_id).filter(Boolean)));
  let trainerMap = new Map<string, { name: string | null; email: string | null }>();
  if (trainerIds.length) {
    const { data: trainers, error: trainerError } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', trainerIds);
    if (!trainerError && trainers) {
      trainerMap = new Map(trainers.map((t) => [t.id, { name: t.name ?? null, email: t.email ?? null }]));
    }
  }

  return NextResponse.json(rows.map((row) => mapSession(row, trainerMap)));
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();

  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  const form = await req.formData();
  let trainerId = String(form.get('trainerId') ?? '').trim();
  if (!trainerId && role === 'PT') trainerId = meId;
  if (!trainerId) {
    return NextResponse.json({ error: 'trainer_required' }, { status: 400 });
  }

  const scheduledAt = String(form.get('startsAt') ?? new Date().toISOString());
  const duration = Number(form.get('durationMin') ?? 60);
  const location = (form.get('location') as string | null) ?? null;
  const notes = (form.get('notes') as string | null) ?? null;

  const insert = {
    trainer_id: trainerId,
    client_id: id,
    scheduled_at: scheduledAt,
    duration_min: Number.isFinite(duration) ? duration : 60,
    location,
    notes,
  } satisfies Partial<SessionRow> & { trainer_id: string; client_id: string; scheduled_at: string; duration_min: number };

  const { data, error } = await sb
    .from('sessions')
    .insert(insert)
    .select('id,trainer_id,client_id,scheduled_at,duration_min,location,notes')
    .single();

  if (error) {
    console.error('[client-sessions] failed to create session', error);
    return NextResponse.json({ error: 'failed_to_create_session' }, { status: 500 });
  }

  const trainerMap = new Map<string, { name: string | null; email: string | null }>();
  if (trainerId) {
    const { data: trainer } = await sb
      .from('users')
      .select('id,name,email')
      .eq('id', trainerId)
      .maybeSingle();
    if (trainer) {
      trainerMap.set(trainer.id, { name: trainer.name ?? null, email: trainer.email ?? null });
    }
  }

  return NextResponse.json(mapSession(data as SessionRow, trainerMap), { status: 201 });
}
