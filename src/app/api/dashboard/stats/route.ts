// src/app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// utilzinho seguro para evitar crash caso o modelo/campo não exista
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export async function GET() {
  const db: any = prisma; // acesso dinâmico evita problemas de typings quando o modelo não existe
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = addDays(start, 1);
  const in7 = addDays(start, 7);

  // Contagens por role (reais)
  const clients = await safe<number>(() => db.user.count({ where: { role: 'CLIENT' } }), 0);
  const trainers = await safe<number>(() => db.user.count({ where: { role: 'TRAINER' } }), 0);
  const admins  = await safe<number>(() => db.user.count({ where: { role: 'ADMIN' } }), 0);

  // Novos clientes nos últimos 7 dias
  const newClients7d = await safe<number>(() => db.user.count({
    where: { role: 'CLIENT', createdAt: { gte: addDays(start, -7) } },
  }), 0);

  // Sessões (pressupõe um modelo "Session" com um campo data do tipo Date — ex.: "date" ou "startAt")
  // Tentamos com "date" e, se falhar, com "startAt".
  const sessionsToday =
    await safe<number>(() => db.session.count({ where: { date: { gte: start, lt: tomorrow } } }), 
    await safe<number>(() => db.session.count({ where: { startAt: { gte: start, lt: tomorrow } } }), 0)
  );

  const sessions7d =
    await safe<number>(() => db.session.count({ where: { date: { gte: start, lt: in7 } } }), 
    await safe<number>(() => db.session.count({ where: { startAt: { gte: start, lt: in7 } } }), 0)
  );

  // Listas para o painel do PT (10 itens máx)
  type RawSess = { id: string; date?: Date; startAt?: Date; type?: string; client?: { name?: string } };

  const todayListByDate = await safe<RawSess[]>(() => db.session.findMany({
    where: { date: { gte: start, lt: tomorrow } }, orderBy: { date: 'asc' }, take: 10,
    select: { id: true, date: true, type: true, client: { select: { name: true } } },
  }), []);

  const todayListByStart = todayListByDate.length ? [] : await safe<RawSess[]>(() => db.session.findMany({
    where: { startAt: { gte: start, lt: tomorrow } }, orderBy: { startAt: 'asc' }, take: 10,
    select: { id: true, startAt: true, type: true, client: { select: { name: true } } },
  }), []);

  const upcomingByDate = await safe<RawSess[]>(() => db.session.findMany({
    where: { date: { gte: tomorrow, lt: in7 } }, orderBy: { date: 'asc' }, take: 10,
    select: { id: true, date: true, type: true, client: { select: { name: true } } },
  }), []);

  const upcomingByStart = upcomingByDate.length ? [] : await safe<RawSess[]>(() => db.session.findMany({
    where: { startAt: { gte: tomorrow, lt: in7 } }, orderBy: { startAt: 'asc' }, take: 10,
    select: { id: true, startAt: true, type: true, client: { select: { name: true } } },
  }), []);

  const toLite = (arr: RawSess[]) =>
    arr.map((s) => {
      const dt = s.date ?? s.startAt ?? null;
      let time: string | undefined;
      let date: string | undefined;
      if (dt) {
        time = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        date = dt.toLocaleDateString();
      }
      return {
        id: String(s.id),
        client: s?.client?.name ?? '—',
        time,
        date,
        type: s?.type ?? '',
      };
    });

  const sessionsTodayList = toLite(todayListByDate.length ? todayListByDate : todayListByStart);
  const upcomingList = toLite(upcomingByDate.length ? upcomingByDate : upcomingByStart);

  return NextResponse.json({
    counts: { clients, trainers, admins },
    sessions7d,
    // Bloco específico para o PT dashboard
    pt: {
      activeClients: clients,
      todaySessions: sessionsToday,
      upcomingSessions: sessions7d,
      newClients7d,
      tasksDue: 0,            // coloca aqui quando tiveres uma tabela de tarefas
      messagesUnread: 0,      // idem mensagens
      sessionsToday: sessionsTodayList,
      upcoming: upcomingList,
    },
  });
}
