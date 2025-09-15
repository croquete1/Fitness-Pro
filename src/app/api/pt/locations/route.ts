// src/app/api/pt/locations/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

// Tipos de conveniência (mantidos simples para evitar conflito com tipos gerados)
type LocationRow = {
  id: string;
  trainer_id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string | null;
};

type CreateBody = {
  name?: string;
  address?: string;
  city?: string;
  notes?: string;
  trainer_id?: string; // só respeitado se ADMIN
};

export async function GET(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const sb = createServerClient();
  const url = new URL(req.url);
  const trainerIdParam = url.searchParams.get('trainerId');

  try {
    // Admin pode ver tudo ou filtrar por ?trainerId
    // PT só vê os seus
    let q = sb
      .from('pt_locations' as any)
      .select('id, trainer_id, name, address, city, notes, created_at')
      .order('created_at', { ascending: false });

    if (role !== 'ADMIN') {
      q = q.eq('trainer_id', me.id);
    } else if (trainerIdParam) {
      q = q.eq('trainer_id', trainerIdParam);
    }

    const { data, error } = await q;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, items: (data ?? []) as LocationRow[] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unexpected_error' }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const sb = createServerClient();

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const trainer_id = role === 'ADMIN' ? (body.trainer_id || me.id) : me.id;

  try {
    const { data, error } = await sb
      .from('pt_locations' as any)
      .insert({
        trainer_id,
        name: body.name ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        notes: body.notes ?? null,
      })
      .select('id, trainer_id, name, address, city, notes, created_at')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: data as LocationRow }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unexpected_error' }, { status: 500 });
  }
}
