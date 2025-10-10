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
  const payload: any = {};
  if (b.status) payload.status = b.status;

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
