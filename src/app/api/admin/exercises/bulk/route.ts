import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

const ALLOWED_DIFFICULTIES = ['Fácil', 'Média', 'Difícil'] as const;
function normalizeDifficulty(v: any): (typeof ALLOWED_DIFFICULTIES)[number] | null {
  if (v == null) return null;
  const s = String(v).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (['facil','easy','beginner','iniciante','leve','fácil','facil'].includes(s)) return 'Fácil';
  if (['media','medio','intermediate','intermedio','moderada','média','media'].includes(s)) return 'Média';
  if (['dificil','difícil','hard','advanced','avancado','avançado','intenso'].includes(s)) return 'Difícil';
  return null;
}

function prune<T extends Record<string, any>>(o: T) {
  const out: Record<string, any> = {};
  Object.keys(o).forEach((k) => { if (o[k] !== undefined) out[k] = o[k]; });
  return out as T;
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { rows } = await req.json().catch(() => ({}));
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'rows vazio' }, { status: 400 });
  }

  let skipped = 0;

  const toInsert = rows
    .map((r: any) => {
      const diff = r.difficulty ?? r.dificuldade;
      const normDiff = diff ? normalizeDifficulty(diff) : null;
      if (diff && !normDiff) { skipped++; return null; }
      return prune({
        name: typeof r.name === 'string' ? r.name.trim() : undefined,
        muscle_group: typeof r.muscle_group === 'string' ? r.muscle_group.trim()
          : (typeof r.muscle === 'string' ? r.muscle.trim() : undefined),
        equipment: typeof r.equipment === 'string' ? r.equipment.trim() : undefined,
        difficulty: normDiff,
        description: typeof r.description === 'string' ? r.description.trim() : undefined,
        video_url: typeof r.video_url === 'string' ? r.video_url.trim() : undefined,
        is_global: true,
        owner_id: null,
        is_published: false,
        published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    })
    .filter((r) => r && (r as any).name) as any[];

  if (toInsert.length === 0) {
    return NextResponse.json({ error: 'Nenhuma linha válida (name obrigatório e dificuldade deve ser Fácil/Média/Difícil).' }, { status: 400 });
  }

  let { error } = await sb.from('exercises').insert(toInsert);
  const missingColumnRegex = /column\s+"?([a-zA-Z0-9_]+)"?\s+does\s+not\s+exist/i;
  let attempts = 0;
  let pruned = toInsert.map((x) => ({ ...x }));

  while (error && attempts < 3) {
    const m = String(error.message || '').match(missingColumnRegex);
    if (!m) break;
    const col = m[1];
    pruned = pruned.map((x) => {
      const y: any = { ...x };
      if (col in y) delete y[col];
      return y;
    });
    attempts++;
    const retry = await sb.from('exercises').insert(pruned);
    error = retry.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, inserted: pruned.length, skipped });
}

export async function DELETE(req: NextRequest) {
  const sb = createServerClient();
  const { ids } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids vazio' }, { status: 400 });
  }
  const { error } = await sb.from('exercises').delete().in('id', ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, deleted: ids.length });
}

export async function PATCH(req: NextRequest) {
  const sb = createServerClient();
  const { ids, patch } = await req.json().catch(() => ({}));

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids vazio' }, { status: 400 });
  }
  if (!patch || typeof patch !== 'object') {
    return NextResponse.json({ error: 'patch vazio' }, { status: 400 });
  }

  const update: any = {};
  if ('muscle_group' in patch) update.muscle_group = patch.muscle_group ?? null;
  if ('equipment' in patch) update.equipment = patch.equipment ?? null;
  if ('difficulty' in patch) {
    const norm = patch.difficulty != null ? normalizeDifficulty(patch.difficulty) : null;
    if (patch.difficulty != null && !norm) {
      return NextResponse.json({ error: 'Dificuldade inválida (Fácil/Média/Difícil)' }, { status: 400 });
    }
    update.difficulty = norm;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 });
  }

  const { error } = await sb.from('exercises').update(update).in('id', ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, updated: ids.length });
}
