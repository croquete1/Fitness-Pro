import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Ctx = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) return supabaseUnavailableResponse();
  const b = await req.json().catch(() => ({}));
  const payload: Record<string, any> = {};
  if (b.status) payload.status = b.status;
  if (b.name !== undefined) payload.name = b.name ?? null;
  if (b.email !== undefined) payload.email = b.email ?? null;
  if (b.trainer_id !== undefined) payload.trainer_id = b.trainer_id ?? null;
  if (b.coach_id !== undefined && payload.trainer_id === undefined) payload.trainer_id = b.coach_id ?? null;
  if (b.requested_at) {
    const iso = new Date(b.requested_at);
    payload.requested_at = Number.isNaN(iso.getTime()) ? b.requested_at : iso.toISOString();
  }
  if (b.metadata !== undefined) {
    let metadata = b.metadata ?? {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = {};
      }
    }
    payload.metadata = metadata && typeof metadata === 'object' ? metadata : {};
  }

  if (payload.status) {
    payload.status = String(payload.status).toLowerCase();
    if (!['pending', 'approved', 'rejected'].includes(payload.status)) {
      delete payload.status;
    }
  }

  if (payload.name !== undefined && payload.name !== null) {
    const trimmed = String(payload.name).trim();
    payload.name = trimmed.length ? trimmed : null;
  }

  if (payload.email !== undefined && payload.email !== null) {
    const trimmed = String(payload.email).trim();
    payload.email = trimmed.length ? trimmed : null;
  }

  if (payload.trainer_id) {
    const trainerId = String(payload.trainer_id).trim();
    payload.trainer_id = trainerId.length ? trainerId : null;
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'NO_FIELDS' }, { status: 400 });
  }

  const upd = async (t: string) => sb.from(t).update(payload).eq('id', id).select('*').maybeSingle();
  let r = await upd('approvals'); if ((r.error && r.error.code === '42P01') || (!r.data && !r.error)) r = await upd('pending_approvals');
  if (r.error) {
    const code = typeof r.error === 'object' && r.error && 'code' in r.error ? (r.error as any).code : 'unknown';
    console.warn('[admin/approvals] patch failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }
  if (!r.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, row: r.data });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) return supabaseUnavailableResponse();
  const del = async (t: string) => sb.from(t).delete().eq('id', id);
  let r = await del('approvals'); if (r.error?.code === '42P01') r = await del('pending_approvals');
  if (r.error) {
    const code = typeof r.error === 'object' && r.error && 'code' in r.error ? (r.error as any).code : 'unknown';
    console.warn('[admin/approvals] delete failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
