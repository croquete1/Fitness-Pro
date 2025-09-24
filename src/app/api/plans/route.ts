// src/app/api/plans/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { z } from 'zod';

const DayItem = z.object({
  exerciseName: z.string().min(1, 'Exercício obrigatório'),
  sets: z.number().int().min(1).default(3),
  reps: z.string().default(''),
  restSec: z.number().int().min(0).default(60),
  note: z.string().optional(),
  media: z
    .object({ path: z.string(), signedUrl: z.string().optional() })
    .nullable()
    .optional(),
});

const Day = z.object({
  dayIndex: z.number().int().min(0).max(6),
  items: z.array(DayItem),
});

const Body = z.object({
  title: z.string().min(1),
  client_id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  days: z.array(Day).length(7, 'Estrutura semanal deve ter 7 dias'),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ ok: false, error: 'UNAUTH' }, { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  let payload: z.infer<typeof Body>;
  try {
    payload = Body.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'INVALID' }, { status: 400 });
  }

  // Apenas o PT dono ou ADMIN pode criar
  if (role === 'PT' && payload.trainer_id !== me.id) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const sb = createServerClient();

  // Tenta inserir usando vários nomes possíveis para a coluna JSON
  const jsonColumnCandidates = ['days', 'structure', 'details', 'data'] as const;
  const base = {
    title: payload.title,
    client_id: payload.client_id,
    trainer_id: payload.trainer_id,
    start_date: payload.start_date || null,
    end_date: payload.end_date || null,
  } as Record<string, any>;

  let planId: string | null = null;
  let lastErr: any = null;

  for (const col of jsonColumnCandidates) {
    try {
      const insertObj = { ...base, [col]: payload.days };
      const { data, error } = await sb
        .from('training_plans' as any)
        .insert(insertObj)
        .select('id')
        .single();
      if (error) throw error;
      planId = data?.id || null;
      break;
    } catch (e) {
      lastErr = e;
      // continua a tentar com a próxima coluna
    }
  }

  if (!planId) {
    return NextResponse.json(
      { ok: false, error: lastErr?.message || 'INSERT_FAILED' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: planId });
}
