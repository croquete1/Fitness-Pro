import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type AnyRow = Record<string, any>;
function map(r: AnyRow) {
  return {
    id: String(r.id),
    name: r.name,
    muscle_group: r.muscle_group ?? r.group ?? null,
    equipment: r.equipment ?? null,
    difficulty: r.difficulty ?? null,
    description: r.description ?? r.instructions ?? null,
    video_url: r.video_url ?? r.video ?? null,
    created_at: r.created_at ?? r.createdAt ?? null,
    deleted_at: r.deleted_at ?? null,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data, error } = await sb.from('exercises').select('*').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ error: error?.message || 'Não encontrado' }, { status: 404 });
  return NextResponse.json({ row: map(data as AnyRow) });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));

  const patch: Record<string, any> = {};
  if ('name' in body) patch.name = body.name;
  if ('muscle_group' in body) patch.muscle_group = body.muscle_group;
  if ('equipment' in body) patch.equipment = body.equipment;
  if ('difficulty' in body) patch.difficulty = body.difficulty;
  if ('description' in body) patch.description = body.description;
  if ('video_url' in body) patch.video_url = body.video_url;
  if ('deleted_at' in body) patch.deleted_at = body.deleted_at; // para UNDO do soft-delete

  const missingColumnRegex = /column\s+"?([a-zA-Z0-9_]+)"?\s+does\s+not\s+exist/i;
  let attempts = 0;
  let dataPayload = { ...patch };
  let lastErr: any = null;
  while (attempts < 4) {
    const { error } = await sb.from('exercises').update(dataPayload).eq('id', params.id);
    if (!error) return NextResponse.json({ ok: true });
    lastErr = error;
    const m = String(error.message || '').match(missingColumnRegex);
    if (!m) break;
    const col = m[1];
    if (col in dataPayload) delete (dataPayload as any)[col];
    attempts++;
  }

  return NextResponse.json({ error: lastErr?.message || 'Falha ao atualizar exercício' }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();

  // 1) Tentar "soft delete" via deleted_at
  const now = new Date().toISOString();
  const soft = await sb.from('exercises').update({ deleted_at: now }).eq('id', params.id);
  if (!soft.error) return NextResponse.json({ ok: true, soft: true });

  // 2) Fallback para delete real
  const hard = await sb.from('exercises').delete().eq('id', params.id);
  if (!hard.error) return NextResponse.json({ ok: true, soft: false });

  return NextResponse.json({ error: hard.error.message }, { status: 400 });
}
