import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/authz';
import { Role } from '@prisma/client';

export async function GET() {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER, Role.CLIENT]);
  if ('error' in guard) return guard.error;
  const { user } = guard;

  if (user.role === Role.ADMIN) {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `select p.*, c.email as client_email, t.email as trainer_email
       from client_packages p
       left join users c on c.id = p.client_id
       left join users t on t.id = p.trainer_id
       order by p.created_at desc`
    );
    return NextResponse.json(rows);
  }
  if (user.role === Role.TRAINER) {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `select p.*, c.email as client_email
       from client_packages p
       join users c on c.id = p.client_id
       where p.trainer_id = $1
       order by p.created_at desc`, user.id
    );
    return NextResponse.json(rows);
  }
  // CLIENT
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `select p.*, t.email as trainer_email
     from client_packages p
     left join users t on t.id = p.trainer_id
     where p.client_id = $1
     order by p.created_at desc`, user.id
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ('error' in guard) return guard.error;
  const { user } = guard;

  const b = await req.json().catch(()=> ({}));
  const data = {
    client_id: String(b.clientId),
    trainer_id: user.role === Role.TRAINER ? user.id : (b.trainerId ?? null),
    title: String(b.title ?? ''),
    sessions_included: Number(b.sessionsIncluded ?? 0),
    sessions_used: Number(b.sessionsUsed ?? 0),
    price_cents: Number(b.priceCents ?? 0),
    currency: String(b.currency ?? 'EUR'),
    start_date: b.startDate ? new Date(b.startDate) : new Date(),
    end_date: b.endDate ? new Date(b.endDate) : null,
    status: String(b.status ?? 'ACTIVE'),
    notes: b.notes ? String(b.notes) : null,
  };
  if (!data.client_id || !data.title) {
    return NextResponse.json({ error: 'Campos obrigatórios: clientId, title' }, { status: 400 });
  }
  const inserted = await prisma.$queryRawUnsafe<any[]>(
    `insert into client_packages
     (client_id, trainer_id, title, sessions_included, sessions_used, price_cents, currency, start_date, end_date, status, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning *`,
     data.client_id, data.trainer_id, data.title, data.sessions_included, data.sessions_used,
     data.price_cents, data.currency, data.start_date, data.end_date, data.status, data.notes
  );
  return NextResponse.json(inserted[0] ?? null, { status: 201 });
}
