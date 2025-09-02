// src/app/api/anthropometry/route.ts
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

// Verifica se o utilizador pode aceder aos dados do clientId
async function ensureAccess(user: { id: string; role?: unknown }, clientId: string) {
  const role = toAppRole((user as any).role); // 'ADMIN' | 'TRAINER' | 'CLIENT'
  if (role === 'ADMIN' || user.id === clientId) return { ok: true as const, role };

  // Se for TRAINER precisa de vínculo em trainer_clients
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false as const, code: 500 as const, msg: error.message };
  return data ? { ok: true as const, role } : { ok: false as const, code: 403 as const, msg: 'Forbidden' };
}

/**
 * GET /api/anthropometry?client=<clientId>
 * - ADMIN pode ler qualquer cliente
 * - TRAINER precisa de vínculo ao cliente
 * - CLIENT só lê os seus próprios registos (se ?client ausente, usa o próprio id)
 */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const queryClient =
    url.searchParams.get('client') ||
    url.searchParams.get('clientId') ||
    undefined;

  const role = toAppRole((user as any).role);
  const clientId = queryClient ?? (role === 'CLIENT' ? user.id : undefined);
  if (!clientId) return new NextResponse('Missing client id', { status: 400 });

  const access = await ensureAccess(user, clientId);
  if (!access.ok) return new NextResponse(access.msg ?? 'Forbidden', { status: access.code ?? 403 });

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

/**
 * POST /api/anthropometry
 * body: { clientId?: string, date?: string, weight?, height?, body_fat_pct?, notes? }
 * - ADMIN pode criar para qualquer cliente (clientId obrigatório)
 * - TRAINER precisa de vínculo ao clientId
 * - CLIENT pode criar para si (clientId opcional; assume o próprio)
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => ({} as Partial<AnthroRow> & { clientId?: string }));
  const role = toAppRole((user as any).role);

  const clientId = body.clientId ?? (body as any).client_id ?? (role === 'CLIENT' ? user.id : undefined);
  if (!clientId) return new NextResponse('Missing client id', { status: 400 });

  const access = await ensureAccess(user, clientId);
  if (!access.ok) return new NextResponse(access.msg ?? 'Forbidden', { status: access.code ?? 403 });

  const row: Partial<AnthroRow> = {
    client_id: clientId,
    date: body.date ?? new Date().toISOString(),
    weight: body.weight ?? null,
    height: body.height ?? null,
    body_fat_pct: (body as any).body_fat_pct ?? null,
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