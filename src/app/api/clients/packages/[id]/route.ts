import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/authz';
import { Role } from '@prisma/client';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ('error' in guard) return guard.error;

  const b = await req.json().catch(()=> ({}));
  const assign = (k: string, v: any) => (v === undefined ? undefined : v);

  const sets: string[] = [];
  const args: any[] = [];
  const push = (sql: string, v: any) => { sets.push(sql); args.push(v); };

  if (assign('title', b.title) !== undefined)                  push(`title = $${args.length+1}`, String(b.title));
  if (assign('sessions_included', b.sessionsIncluded) !== undefined) push(`sessions_included = $${args.length+1}`, Number(b.sessionsIncluded));
  if (assign('sessions_used', b.sessionsUsed) !== undefined)   push(`sessions_used = $${args.length+1}`, Number(b.sessionsUsed));
  if (assign('price_cents', b.priceCents) !== undefined)       push(`price_cents = $${args.length+1}`, Number(b.priceCents));
  if (assign('currency', b.currency) !== undefined)            push(`currency = $${args.length+1}`, String(b.currency));
  if (assign('start_date', b.startDate) !== undefined)         push(`start_date = $${args.length+1}`, b.startDate? new Date(b.startDate): null);
  if (assign('end_date', b.endDate) !== undefined)             push(`end_date = $${args.length+1}`, b.endDate? new Date(b.endDate): null);
  if (assign('status', b.status) !== undefined)                push(`status = $${args.length+1}`, String(b.status));
  if (assign('notes', b.notes) !== undefined)                  push(`notes = $${args.length+1}`, b.notes ?? null);

  if (!sets.length) return NextResponse.json({ error:'Nada para atualizar' }, { status:400 });

  args.push(params.id);
  const updated = await prisma.$queryRawUnsafe<any[]>(
    `update client_packages set ${sets.join(', ')} where id = $${args.length} returning *`, ...args
  );
  return NextResponse.json(updated[0] ?? null);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.$executeRawUnsafe(
    `delete from client_packages where id = $1`, params.id
  );
  return NextResponse.json({ ok:true });
}
