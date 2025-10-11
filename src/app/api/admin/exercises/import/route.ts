import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Row = {
  name: string;
  muscle_group?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  description?: string | null;
  video_url?: string | null;
};

function parseCsv(text: string): Row[] {
  // Aceita ; ou , como separador. Primeira linha = cabeçalho.
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];
  const sep = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].split(sep).map((h) => h.trim().toLowerCase());

  const idx = (k: string) => header.indexOf(k);

  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(sep);
    const val = (k: string) => {
      const j = idx(k);
      return j >= 0 ? (parts[j] ?? '').trim() : '';
    };
    const r: Row = {
      name: val('name'),
      muscle_group: val('muscle_group') || null,
      equipment: val('equipment') || null,
      difficulty: val('difficulty') || null,
      description: val('description') || null,
      video_url: val('video_url') || null,
    };
    if (r.name) rows.push(r);
  }
  return rows;
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const contentType = req.headers.get('content-type') || '';

  let payload: Row[] = [];
  if (contentType.includes('text/csv')) {
    const text = await req.text();
    payload = parseCsv(text);
  } else {
    const body = await req.json().catch(() => ({}));
    payload = Array.isArray(body?.rows) ? body.rows : [];
  }

  if (!payload.length) return NextResponse.json({ error: 'Nada para importar' }, { status: 400 });

  // Inserção resiliente: remove colunas inexistentes se o motor reclamar
  const missingColumnRegex = /column\s+"?([a-zA-Z0-9_]+)"?\s+does\s+not\s+exist/i;
  let attempts = 0;
  let dataPayload: any[] = payload.map((r) => ({
    name: r.name,
    muscle_group: r.muscle_group ?? null,
    equipment: r.equipment ?? null,
    difficulty: r.difficulty ?? null,
    description: r.description ?? null,
    video_url: r.video_url ?? null,
    is_global: true,
    owner_id: null,
    is_published: false,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  let lastErr: any = null;

  while (attempts < 4) {
    const { error } = await sb.from('exercises').insert(dataPayload);
    if (!error) return NextResponse.json({ ok: true, inserted: dataPayload.length });
    lastErr = error;
    const m = String(error.message || '').match(missingColumnRegex);
    if (!m) break;
    const col = m[1];
    dataPayload = dataPayload.map((r) => { const { [col]: _, ...rest } = r; return rest; });
    attempts++;
  }

  return NextResponse.json({ error: lastErr?.message || 'Falha ao importar' }, { status: 400 });
}
