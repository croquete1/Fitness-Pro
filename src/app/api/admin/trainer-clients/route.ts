import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Body = {
  trainerId?: string | null;
  trainer_id?: string | null;
  clientId?: string | null;
  client_id?: string | null;
};

function normalizeId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function GET(req: Request): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const url = new URL(req.url);
  const trainerId = url.searchParams.get('trainerId');

  const sb = createServerClient();
  let q = sb.from('trainer_clients').select('id, trainer_id, client_id, created_at').order('created_at', { ascending: false });
  if (trainerId) q = q.eq('trainer_id', trainerId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function POST(req: Request): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const payload = (await req.json().catch(() => null)) as Body | null;
  const trainerId = normalizeId(payload?.trainerId ?? payload?.trainer_id ?? null);
  const clientId = normalizeId(payload?.clientId ?? payload?.client_id ?? null);
  if (!trainerId || !clientId) {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const sb = createServerClient();
  const { error } = await sb
    .from('trainer_clients')
    .upsert({ trainer_id: trainerId, client_id: clientId }, { onConflict: 'trainer_id,client_id' });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message ?? 'FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const payload = (await req.json().catch(() => null)) as Body | null;
  const trainerId = normalizeId(payload?.trainerId ?? payload?.trainer_id ?? null);
  const clientId = normalizeId(payload?.clientId ?? payload?.client_id ?? null);
  if (!trainerId || !clientId) {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const sb = createServerClient();
  const { error } = await sb
    .from('trainer_clients')
    .delete()
    .eq('trainer_id', trainerId)
    .eq('client_id', clientId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message ?? 'FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
