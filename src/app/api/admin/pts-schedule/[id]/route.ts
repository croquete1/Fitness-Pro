import { NextResponse } from 'next/server';
import { z } from 'zod';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseConfigErrorResponse, supabaseFallbackJson } from '@/lib/supabase/responses';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

const PatchSchema = z.object({
  trainer_id: z.string().optional(),
  client_id: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(['scheduled','done','cancelled']).optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const sb = await tryGetSBC();
    if (!sb) {
      return supabaseFallbackJson(
        { ok: false, message: 'Supabase não está configurado.' },
        { status: 503 }
      );
    }
    const body = await _req.json();
    const patch = PatchSchema.parse(body);

    const { data: before } = await sb
      .from('pts_sessions')
      .select('id, trainer_id, client_id, start_time, end_time, status, location')
      .eq('id', id)
      .maybeSingle();

    const { error } = await sb.from('pts_sessions')
      .update(patch)
      .eq('id', id);

    if (error) throw error;
    const { data: { user } } = await sb.auth.getUser();
    await logAudit(sb, {
      actorId: user?.id ?? null,
      kind: AUDIT_KINDS.UPDATE,
      targetType: AUDIT_TARGET_TYPES.SESSION,
      targetId: id,
      message: 'Atualização de sessão PT',
      details: { before, patch },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const config = supabaseConfigErrorResponse(e);
    if (config) return config;
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const sb = await tryGetSBC();
    if (!sb) {
      return supabaseFallbackJson(
        { ok: false, message: 'Supabase não está configurado.' },
        { status: 503 }
      );
    }
    const { data: before } = await sb
      .from('pts_sessions')
      .select('id, trainer_id, client_id, start_time, end_time, status, location')
      .eq('id', id)
      .maybeSingle();

    const { error } = await sb.from('pts_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    const { data: { user } } = await sb.auth.getUser();
    await logAudit(sb, {
      actorId: user?.id ?? null,
      kind: AUDIT_KINDS.DELETE,
      targetType: AUDIT_TARGET_TYPES.SESSION,
      targetId: id,
      message: 'Remoção de sessão PT',
      details: { before },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const config = supabaseConfigErrorResponse(e);
    if (config) return config;
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
