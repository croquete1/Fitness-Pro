import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/sessions';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function GET(req: Request, { params }: { params: { clientId: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clientId = params.clientId;
    if (!isUuid(clientId)) {
      return NextResponse.json({ error: 'clientId inválido' }, { status: 400 });
    }

    // Permissões: admin, o próprio cliente, ou PT com vínculo ao cliente
    if (user.role !== Role.ADMIN && user.id !== clientId) {
      const link = await prisma.$queryRaw<{ ok: boolean }[]>`
        select true as ok
        from trainer_clients
        where trainer_id = ${user.id}::uuid
          and client_id  = ${clientId}::uuid
        limit 1
      `;
      const allowed = Array.isArray(link) && link.length > 0;
      if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Filtros opcionais
    const url = new URL(req.url);
    const from = url.searchParams.get('from'); // YYYY-MM-DD
    const to   = url.searchParams.get('to');   // YYYY-MM-DD
    let limit  = Number(url.searchParams.get('limit') ?? 200);
    if (!Number.isFinite(limit) || limit < 1 || limit > 1000) limit = 200;

    // Query (ordenado DESC por data, depois created_at)
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      select
        id,
        client_id,
        created_by_id,
        date::date as date,
        height_cm::double precision   as height_cm,
        weight_kg::double precision   as weight_kg,
        body_fat_pct::double precision as body_fat_pct,
        chest_cm::double precision    as chest_cm,
        waist_cm::double precision    as waist_cm,
        hip_cm::double precision      as hip_cm,
        thigh_cm::double precision    as thigh_cm,
        arm_cm::double precision      as arm_cm,
        calf_cm::double precision     as calf_cm,
        shoulders_cm::double precision as shoulders_cm,
        neck_cm::double precision     as neck_cm,
        notes,
        created_at,
        updated_at
      from anthropometry
      where client_id = $1::uuid
        and ($2::date is null or date >= $2::date)
        and ($3::date is null or date <= $3::date)
      order by date desc, created_at desc
      limit $4
    `, clientId, from, to, limit);

    return NextResponse.json(rows ?? [], {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    console.error('GET /api/anthropometry/[clientId] error', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
