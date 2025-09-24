// src/app/api/clients/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

/**
 * GET -> devolve uma pergunta (real se houver sessão no dia/ontem; caso contrário fallback)
 * POST -> grava o feedback, se existirem tabelas compatíveis (client_feedback/checkins)
 */

export async function GET(_req: NextRequest) {
  const sb = createServerClient();
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ mode: 'fallback', question: pickFallback('today') });

    const now = new Date();
    const coreToday = await findCoreExercise(sb, user.id, now);
    if (coreToday) {
      return NextResponse.json({ mode: 'real', question: `Como correu ${coreToday} na sessão de hoje?` });
    }

    const y = new Date(now); y.setDate(now.getDate() - 1);
    const coreYesterday = await findCoreExercise(sb, user.id, y);
    if (coreYesterday) {
      return NextResponse.json({ mode: 'real', question: `Como te sentiste em ${coreYesterday} na sessão de ontem?` });
    }

    return NextResponse.json({ mode: 'fallback', question: pickFallback('auto') });
  } catch {
    return NextResponse.json({ mode: 'fallback', question: pickFallback('auto') });
  }
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  try {
    const { data: { user } } = await sb.auth.getUser();
    const { question, answer } = await req.json().catch(() => ({}));
    if (!user || !answer) return NextResponse.json({ ok: true });

    const payload = {
      user_id: user.id,
      question,
      answer,
      created_at: new Date().toISOString(),
    };

    // tenta inserir numa das tabelas seguintes, sem partir se não existirem
    for (const table of ['client_feedback', 'checkins']) {
      try {
        const { error } = await sb.from(table as any).insert(payload as any);
        if (!error) break;
      } catch {}
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

/** tenta obter o exercício “core” da sessão do dia, com tolerância a schemas diferentes */
async function findCoreExercise(sb: any, clientId: string, day: Date): Promise<string | null> {
  const start = new Date(day); start.setHours(0,0,0,0);
  const end = new Date(day);   end.setHours(23,59,59,999);

  // Ajusta aqui se as tuas colunas tiverem nomes diferentes
  const candidates = [
    { table: 'sessions', select: 'id, title, client_id, start_at, core_exercise', client: 'client_id', date: 'start_at', core: 'core_exercise', title: 'title' },
    { table: 'workout_sessions', select: 'id, name, client_id, scheduled_at, main_exercise', client: 'client_id', date: 'scheduled_at', core: 'main_exercise', title: 'name' },
  ];

  for (const c of candidates) {
    try {
      const { data, error } = await sb
        .from(c.table)
        .select(c.select)
        .eq(c.client, clientId)
        .gte(c.date, start.toISOString())
        .lte(c.date, end.toISOString())
        .order(c.date, { ascending: false })
        .limit(1);

      if (!error && Array.isArray(data) && data.length) {
        const row = data[0] as any;
        return row?.[c.core] ?? row?.[c.title] ?? null;
      }
    } catch {}
  }
  return null;
}

function pickFallback(kind: 'today' | 'auto') {
  const today = [
    'Qual o objetivo principal para o treino de hoje?',
    'Há alguma limitação ou dor antes de começares o treino?',
  ];
  const auto = [
    'Como te sentiste no exercício principal do treino anterior?',
    'Houve dor/desconforto no treino anterior?',
  ];
  const pool = kind === 'today' ? today : auto;
  return pool[new Date().getDate() % pool.length];
}
