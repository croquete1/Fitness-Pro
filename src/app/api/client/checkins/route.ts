import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// Tabela esperada: public.checkins
// Colunas sugeridas: id uuid PK, user_id uuid, date date, energy int, soreness int, note text, created_at timestamptz
// Unique sugerido: UNIQUE (user_id, date)

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const energy = Number(body.energy ?? 0);
  const soreness = Number(body.soreness ?? 0);
  const note = (body.note ?? null) as string | null;

  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth() + 1, d = today.getDate();
  const isoDate = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  try {
    // UPSERT por (user_id, date) se existir unique
    const { error } = await sb
      .from('checkins' as any)
      .upsert(
        [{ user_id: user.id, date: isoDate, energy, soreness, note }],
        { onConflict: 'user_id,date' as any }
      )
      .select()
      .single();

    if (error) {
      // fallback: tenta insert “simples” (se não houver unique)
      const ins = await sb.from('checkins' as any).insert([{ user_id: user.id, date: isoDate, energy, soreness, note }]);
      if (ins.error) throw ins.error;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'DB', detail: e?.message ?? String(e) }, { status: 500 });
  }
}

export async function GET() {
  // opcional: devolver últimos N check-ins do utilizador autenticado
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  try {
    const { data, error } = await sb
      .from('checkins' as any)
      .select('date, energy, soreness, note')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);
    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: 'DB', detail: e?.message ?? String(e) }, { status: 500 });
  }
}
