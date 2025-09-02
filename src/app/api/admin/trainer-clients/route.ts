import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUser } from '@/lib/auth';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  if (!clientId) return NextResponse.json([], { status: 200 });

  const { data: links, error } = await supabase
    .from('trainer_clients')
    .select('id,trainer_id,client_id,created_at,trainer:trainer_id (id,name,email)')
    .eq('client_id', clientId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(links ?? []);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createServerClient();
  const body = await req.json().catch(() => ({} as any));
  const trainerId = String(body.trainerId ?? '');
  const clientId = String(body.clientId ?? '');

  if (!clientId) return NextResponse.json({ ok: false, error: 'MISSING_CLIENT_ID' }, { status: 400 });

  // apaga vínculo anterior e, se existir trainerId, cria novo
  const del = await supabase.from('trainer_clients').delete().eq('client_id', clientId);
  if (del.error) return NextResponse.json({ ok: false, error: del.error.message }, { status: 500 });

  let linkId: string | null = null;

  if (trainerId) {
    const ins = await supabase
      .from('trainer_clients')
      .insert({ trainer_id: trainerId, client_id: clientId })
      .select('id')
      .single();
    if (ins.error) return NextResponse.json({ ok: false, error: ins.error.message }, { status: 500 });
    linkId = ins.data.id as string;
  }

  // audit seguro (sem enums “novos”)
  try {
    await logAudit({
      kind: AUDIT_KINDS.ACCOUNT_ROLE_CHANGE,
      message: trainerId ? 'TRAINER_ASSIGNED' : 'TRAINER_UNASSIGNED',
      actorId: user.id,
      targetType: AUDIT_TARGET_TYPES.USER,
      targetId: clientId,
      diff: { trainerId: trainerId || null, linkId },
    });
  } catch { /* silencia para não falhar build */ }

  return NextResponse.json({ ok: true, linkId });
}