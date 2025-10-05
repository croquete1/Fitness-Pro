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
  };
}

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const mg = (searchParams.get('muscle_group') || '').trim().toLowerCase();
  const diff = (searchParams.get('difficulty') || '').trim().toLowerCase();

  const { data, error } = await sb.from('exercises').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const all = (data ?? []).map(map);

  const filtered = all.filter((r) => {
    const okQ = q ? String(r.name ?? '').toLowerCase().includes(q) : true;
    const okMg = mg ? String(r.muscle_group ?? '').toLowerCase().includes(mg) : true;
    const okDf = diff ? String(r.difficulty ?? '').toLowerCase().includes(diff) : true;
    const notDeleted = !('deleted_at' in (r as any)) || !(r as any).deleted_at; // se existir coluna
    return okQ && okMg && okDf && notDeleted;
  });

  const count = filtered.length;
  const from = (page - 1) * pageSize;
  const to = Math.min(from + pageSize, count);
  return NextResponse.json({ rows: filtered.slice(from, to), count });
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));

  const payload: Record<string, any> = {
    name: body.name,
    muscle_group: body.muscle_group ?? null,
    equipment: body.equipment ?? null,
    difficulty: body.difficulty ?? null,
    description: body.description ?? null,
    video_url: body.video_url ?? null,
  };

  if (!payload.name || String(payload.name).trim().length === 0) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  // Inserção resiliente (remove colunas inexistentes e tenta de novo)
  const missingColumnRegex = /column\s+"?([a-zA-Z0-9_]+)"?\s+does\s+not\s+exist/i;
  let attempts = 0;
  let dataPayload = { ...payload };
  let lastErr: any = null;
  while (attempts < 4) {
    const { error } = await sb.from('exercises').insert(dataPayload);
    if (!error) return NextResponse.json({ ok: true });
    lastErr = error;
    const m = String(error.message || '').match(missingColumnRegex);
    if (!m) break;
    const col = m[1];
    if (col in dataPayload) delete (dataPayload as any)[col];
    attempts++;
  }

  return NextResponse.json({ error: lastErr?.message || 'Falha ao criar exercício' }, { status: 400 });
}
