import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  let r = await sb.from('plans').select('*').eq('id', id).maybeSingle();
  if (!r.data && !r.error) r = await sb.from('programs').select('*').eq('id', id).maybeSingle();
  if (!r.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ row: r.data });
}

export async function PATCH(req: Request, ctx: Ctx) {
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

  let r = await tryUpdate('plans');
  if ((r.error && r.error.code === '42P01') || (!r.data && !r.error)) {
    r = await tryUpdate('programs');
  }

  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  if (!r.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, row: r.data });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const tryDel = async (table: string) => sb.from(table).delete().eq('id', id);
  let r = await tryDel('plans');
  if (r.error?.code === '42P01' || (!r.data && !r.error)) r = await tryDel('programs');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
