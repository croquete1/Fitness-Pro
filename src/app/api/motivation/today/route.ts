// src/app/api/motivation/today/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

function dayKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return `${y}-${m + 1}-${day}`;
}
function seededPick<T>(arr: T[], seed: number) {
  if (!arr.length) return null;
  const idx = Math.abs(seed) % arr.length;
  return arr[idx];
}

export async function GET() {
  const session = await getSessionUserSafe();
  const userId = session?.user?.id ?? 'anon';
  const sb = createServerClient();

  // buscar frases (tenta motivation_phrases; fallback phrases)
  let rows: Array<{ id: string; text: string; author?: string | null }> = [];
  try {
    const { data } = await sb.from('motivation_phrases' as any).select('id,text,author').order('id');
    if (data?.length) rows = data as any;
  } catch {}
  if (!rows.length) {
    try {
      const { data } = await sb.from('phrases' as any).select('id,text,author').order('id');
      if (data?.length) rows = data as any;
    } catch {}
  }

  if (!rows.length) {
    return NextResponse.json({
      ok: true, phrase: { id: 'fallback', text: 'A consistência vence a motivação. 💪', author: 'HMS' },
    });
  }

  // escolher “deterministicamente” por dia + user → parece aleatório e não repete dia-a-dia
  const key = dayKey();
  let seed = 0;
  for (const ch of (userId + '|' + key)) seed = (seed * 131 + ch.charCodeAt(0)) | 0;
  let pick = seededPick(rows, seed);
  // evitar repetir exatamente a mesma do dia anterior: desloca 1 se for igual ao índice “ontem”
  let prevSeed = 0;
  const d = new Date(); d.setUTCDate(d.getUTCDate() - 1);
  for (const ch of (userId + '|' + dayKey(d))) prevSeed = (prevSeed * 131 + ch.charCodeAt(0)) | 0;
  if (rows.length > 1 && rows.indexOf(pick!) === Math.abs(prevSeed) % rows.length) {
    pick = rows[(rows.indexOf(pick!) + 1) % rows.length];
  }

  return NextResponse.json({ ok: true, phrase: pick });
}
