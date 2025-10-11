import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { syncUserProfile } from '@/lib/profileSync';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const reason = body.reason ? String(body.reason) : null;

  let metadata: Record<string, unknown> | undefined;
  if (reason) {
    const { data: metaRow } = await sb.from('users').select('metadata').eq('id', id).maybeSingle();
    const base =
      metaRow?.metadata && typeof metaRow.metadata === 'object' && !Array.isArray(metaRow.metadata)
        ? { ...(metaRow.metadata as Record<string, unknown>) }
        : {};
    base.rejection_reason = reason;
    metadata = base;
  }

  const patch: Record<string, unknown> = { status: 'SUSPENDED', approved: false };
  if (metadata !== undefined) patch.metadata = metadata;

  const result = await syncUserProfile(sb, id, patch);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true });
}
