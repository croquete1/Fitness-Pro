import { NextResponse } from 'next/server';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id } = await ctx.params;
  const sb = createServerClient();
  const b = await req.json().catch(() => ({}));
  const payload: any = {};
  if (typeof b.read === 'boolean') payload.read = b.read;

  const upd = async (t: string) => {
    const enrichedPayload = await withAuditMetadata(sb, t, id, payload, guard.me);
    return sb.from(t).update(enrichedPayload).eq('id', id).select('*').maybeSingle();
  };
  let r = await upd('notifications');
  if ((r.error && r.error.code === '42P01') || (!r.data && !r.error)) r = await upd('user_notifications');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  if (!r.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, row: r.data });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id } = await ctx.params;
  const sb = createServerClient();
  const del = async (t: string) => sb.from(t).delete().eq('id', id);
  let r = await del('notifications'); if (r.error?.code === '42P01') r = await del('user_notifications');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

type AuditActor = { id: string; role: string };

async function withAuditMetadata(
  sb: ReturnType<typeof createServerClient>,
  table: string,
  id: string,
  payload: Record<string, unknown>,
  actor: AuditActor,
) {
  if (table !== 'notifications') return payload;

  const { data, error } = await sb.from(table).select('metadata').eq('id', id).maybeSingle();
  if (error) {
    if (error.code === '42P01') return payload;
    if (error.code === '42703') return payload;
    console.warn('[admin/notifications] metadata fetch failed', { table, code: error.code });
    return payload;
  }
  if (!data) return payload;

  const metadata = normalizeMetadata((data as { metadata?: unknown }).metadata);
  const auditTrail = normalizeMetadata(metadata._audit);
  metadata._audit = {
    ...auditTrail,
    actor_id: actor.id,
    actor_role: actor.role,
    last_action: 'PATCH',
  };

  return { ...payload, metadata };
}

function normalizeMetadata(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...(parsed as Record<string, unknown>) };
      }
    } catch (error) {
      console.warn('[admin/notifications] metadata JSON parse failed', { error });
      return {};
    }
    return {};
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>) };
  }
  return {};
}
