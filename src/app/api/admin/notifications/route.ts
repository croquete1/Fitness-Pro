import { NextResponse } from 'next/server';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') ?? '0');
  const pageSize = Math.min(Number(url.searchParams.get('pageSize') ?? '20'), 100);
  const q = (url.searchParams.get('q') || '').trim();
  const type = (url.searchParams.get('type') || '').trim();
  const unread = url.searchParams.get('unread') === 'true';

  const sb = createServerClient();

  async function base(table: string) {
    let sel = sb.from(table).select('*', { count: 'exact' });
    if (q) sel = sel.or(`title.ilike.%${q}%,subject.ilike.%${q}%,body.ilike.%${q}%,message.ilike.%${q}%`);
    if (type) sel = sel.or(`type.eq.${type},kind.eq.${type}`);
    if (unread) sel = sel.or('read.eq.false,is_read.eq.false');
    const from = page * pageSize, to = from + pageSize - 1;
    return sel.range(from, to).order('created_at', { ascending: false }).order('id', { ascending: true });
  }

  let r = await base('notifications');
  if (!r.data && !r.error) r = await base('user_notifications');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });

  return NextResponse.json({ rows: r.data ?? [], count: r.count ?? 0 });
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const b = await req.json().catch(() => ({}));

  const metadata = normalizeMetadata(b.metadata);
  const auditTrail = normalizeMetadata(metadata._audit);
  metadata._audit = {
    ...auditTrail,
    actor_id: guard.me.id,
    actor_role: guard.me.role,
  };

  const payload = {
    user_id: b.user_id ?? b.uid ?? null,
    title: b.title ?? b.subject ?? null,
    body: b.body ?? b.message ?? null,
    type: b.type ?? b.kind ?? 'info',
    read: Boolean(b.read ?? false),
    metadata,
  };
  const ins = async (t: string, customPayload = payload) =>
    sb.from(t).insert(customPayload).select('*').single();
  let r = await ins('notifications');
  if (r.error?.code === '42P01') {
    const legacyPayload = { ...payload };
    delete (legacyPayload as any).metadata;
    r = await ins('user_notifications', legacyPayload);
  }
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  return NextResponse.json({ ok: true, row: r.data });
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
