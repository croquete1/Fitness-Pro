// Devolve 1 frase/dia por utilizador, sem repetir nos últimos 30 dias.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { brand } from '@/lib/brand';

function hashIdx(seed: string, len: number) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return len ? (h >>> 0) % len : 0;
}

export async function GET() {
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson({ ok: true, item: { text: 'Foco, disciplina e consistência 💪', author: brand.name } });
  }
  const { data: auth } = await sb.auth.getUser();
  const meId = auth?.user?.id ?? null;

  // lista ativa
  const { data: list, error } = await sb
    .from('motivational_quotes')
    .select('id,text,author,active')
    .eq('active', true)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });

  const all = list ?? [];
  if (!all.length) {
    return NextResponse.json({ ok:true, item: { text: 'Foco, disciplina e consistência 💪', author: brand.name } });
  }

  const today = new Date().toISOString().slice(0,10);
  let chosen = all[ hashIdx((meId ?? 'anon') + '|' + today, all.length) ];

  if (meId) {
    const since = new Date(); since.setDate(since.getDate() - 30);
    const { data: used } = await sb.from('user_motivation_history')
      .select('quote_id').eq('user_id', meId).gte('shown_on', since.toISOString().slice(0,10));
    const usedSet = new Set((used ?? []).map((r:any)=>r.quote_id));
    const candidates = all.filter(q => !usedSet.has(q.id));
    if (candidates.length) {
      chosen = candidates[ hashIdx(meId + '|' + today, candidates.length) ];
    }
    // Regista o “do dia” (idempotente pela PK (user_id, shown_on))
    await sb.from('user_motivation_history').upsert({ user_id: meId, quote_id: chosen.id, shown_on: today });
  }

  return NextResponse.json({ ok:true, item: { id: chosen.id, text: chosen.text, author: chosen.author ?? null } });
}
