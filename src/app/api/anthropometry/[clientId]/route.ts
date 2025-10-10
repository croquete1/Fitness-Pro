// src/app/api/anthropometry/[clientId]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type AnthroRow = {
  id: string;
  client_id: string;
  date: string; // ISO
  weight?: number | null;
  height?: number | null;
  body_fat_pct?: number | null;
  notes?: string | null;
};

async function ensureCanAccess(clientId: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, code: 401 as const };

  const role = toAppRole((user as any).role); // 'ADMIN' | 'TRAINER' | 'CLIENT'
  if (role === 'ADMIN' || user.id === clientId) return { ok: true as const, user, role };

  // PT com vínculo ao cliente (trainer_clients)
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .limit(1)
    .maybeSingle();

  if (error) {
    // não rebentar por erro de leitura; tratar como sem acesso
    return { ok: false as const, code: 403 as const };
  }

  return data ? { ok: true as const, user, role } : { ok: false as const, code: 403 as const };
}

type Ctx = { params: Promise<{ clientId: string }> };

/** GET: lista últimas medições do cliente */
export async function GET(_: Request, ctx: Ctx) {
  const { clientId } = await ctx.params;
  const access = await ensureCanAccess(clientId);
  if (!access.ok) {
    return new NextResponse(access.code === 401 ? 'Unauthorized' : 'Forbidden', { status: access.code });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('anthropometry')
    .select('id, client_id, date, weight, height, body_fat_pct, notes')
    .eq('client_id', clientId)
    .order('date', { ascending: false })
    .limit(100);

  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json((data ?? []) as AnthroRow[]);
}

/** POST: cria uma medição para o cliente (ADMIN, TRAINER com vínculo, ou o próprio CLIENT) */
export async function POST(req: Request, ctx: Ctx) {
  const { clientId } = await ctx.params;
  const access = await ensureCanAccess(clientId);
  if (!access.ok) {
    return new NextResponse(access.code === 401 ? 'Unauthorized' : 'Forbidden', { status: access.code });
  }

  const body = await req.json().catch(() => ({} as Partial<AnthroRow>));
  const row: Partial<AnthroRow> = {
    client_id: clientId,
    date: body.date ?? new Date().toISOString(),
    weight: body.weight ?? null,
    height: body.height ?? null,
    body_fat_pct: body.body_fat_pct ?? null,
    notes: body.notes ?? null,
  };

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('anthropometry')
    .insert(row)
    .select('id, client_id, date, weight, height, body_fat_pct, notes')
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(data as AnthroRow, { status: 201 });
}