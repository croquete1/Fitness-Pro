import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

function formatICSDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function sanitize(text: string | null | undefined) {
  if (!text) return '';
  return String(text).replace(/[\r\n]+/g, '\\n');
}

export async function GET(_req: Request, ctx: Ctx) {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const sb = createServerClient();

  const { data, error } = await sb
    .from('sessions' as any)
    .select(
      'id,title,notes,start_at,end_at,duration_min,location,trainer_id,client_id,trainer:users!sessions_trainer_id_fkey(name,email),client:users!sessions_client_id_fkey(name,email)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
  }

  const role = toAppRole(viewer.role);
  const allowed =
    role === 'ADMIN' ||
    viewer.id === data.trainer_id ||
    viewer.id === data.client_id;

  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const startIso = (data as any).start_at ?? (data as any).scheduled_at ?? null;
  if (!startIso) {
    return NextResponse.json({ error: 'Sessão sem data' }, { status: 400 });
  }

  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
  }

  const durationMin = Number((data as any).duration_min ?? 60);
  const end = (data as any).end_at ? new Date((data as any).end_at) : new Date(start.getTime() + durationMin * 60000);

  const trainerName = (data as any).trainer?.name ?? null;
  const trainerEmail = (data as any).trainer?.email ?? null;
  const clientName = (data as any).client?.name ?? null;

  const summary = data.title
    ? sanitize(data.title)
    : trainerName
      ? `Sessão com ${trainerName}`
      : 'Sessão de treino';

  const descriptionParts = [
    trainerName ? `Treinador: ${trainerName}` : null,
    trainerEmail ? `Email do PT: ${trainerEmail}` : null,
    clientName ? `Cliente: ${clientName}` : null,
    data.notes ? `Notas: ${sanitize(data.notes)}` : null,
  ].filter(Boolean);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fitness Pro//Agenda//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:session-${data.id}@fitness-pro.local`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${summary}`,
    data.location ? `LOCATION:${sanitize(data.location)}` : 'LOCATION:',
    descriptionParts.length ? `DESCRIPTION:${descriptionParts.join(' \n')}` : 'DESCRIPTION:',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const body = lines.join('\r\n');
  return new NextResponse(body, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="sessao-${data.id}.ics"`,
    },
  });
}
