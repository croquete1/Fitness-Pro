import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Ctx = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id } = await ctx.params;
  const sb = createServerClient();
  for (const table of ['plans', 'training_plans', 'programs']) {
    const r = await sb.from(table).select('*').eq('id', id).maybeSingle();
    if (r.error) {
      const code = r.error.code ?? '';
      if (code === 'PGRST205' || code === 'PGRST301') continue;
      return NextResponse.json({ error: r.error.message }, { status: 400 });
    }
    if (r.data) return NextResponse.json({ row: r.data });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id } = await ctx.params;
  const sb = createServerClient();
  const b = await req.json().catch(() => ({}));
  const payload = {
    name: b.name ?? b.title ?? null,
    description: b.description ?? b.details ?? null,
    difficulty: b.difficulty ?? b.level ?? null,
    duration_weeks: b.duration_weeks ?? b.duration ?? null,
    is_public: b.is_public ?? b.public ?? false,
  };

  const tryUpdate = async (table: string) =>
    sb.from(table).update(payload).eq('id', id).select('*').maybeSingle();

  for (const table of ['plans', 'training_plans', 'programs']) {
    const r = await tryUpdate(table);
    if (r.error) {
      const code = r.error.code ?? '';
      if (code === 'PGRST205' || code === '42P01' || code === 'PGRST301' || r.error.message?.includes('relation')) continue;
      return NextResponse.json({ error: r.error.message }, { status: 400 });
    }
    if (r.data) return NextResponse.json({ ok: true, row: r.data });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id } = await ctx.params;
  const sb = createServerClient();
  const tryDel = async (table: string) => sb.from(table).delete().eq('id', id);
  for (const table of ['plans', 'training_plans', 'programs']) {
    const r = await tryDel(table);
    if (r.error) {
      const code = r.error.code ?? '';
      if (code === 'PGRST205' || code === '42P01' || code === 'PGRST301') continue;
      return NextResponse.json({ error: r.error.message }, { status: 400 });
    }
    if (r.count && r.count > 0) return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: true });
}
