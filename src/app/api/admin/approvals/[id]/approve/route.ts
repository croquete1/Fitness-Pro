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
  const role = String(body.role || 'CLIENT');

  const { data: metaRow } = await sb.from('users').select('metadata').eq('id', id).maybeSingle();
  let metadata: Record<string, unknown> | null | undefined;
  const rawMeta = metaRow?.metadata;
  if (rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)) {
    const clone = { ...(rawMeta as Record<string, unknown>) };
    if ('rejection_reason' in clone) {
      delete clone.rejection_reason;
      metadata = Object.keys(clone).length ? clone : null;
    }
  }

  const patch: Record<string, unknown> = {
    role,
    status: 'ACTIVE',
    approved: true,
    active: true,
  };
  if (metadata !== undefined) patch.metadata = metadata;

  const result = await syncUserProfile(sb, id, patch);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true });
}
