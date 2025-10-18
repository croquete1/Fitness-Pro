import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { assertCanViewClient } from '@/lib/acl';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

const NOTE_SELECT = 'id, client_id, author_id, author_name, author_role, text, created_at';

type Ctx = { params: Promise<{ id: string }> };

type NoteRow = {
  id: string;
  client_id: string;
  author_id: string | null;
  author_name: string | null;
  author_role: string | null;
  text: string;
  created_at: string | null;
};

function toPayload(row: NoteRow) {
  return {
    id: row.id,
    createdAt: row.created_at ?? new Date().toISOString(),
    author: row.author_name ?? row.author_role ?? 'Equipa',
    text: row.text,
  };
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();
  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  const { data, error } = await sb
    .from('client_notes')
    .select(NOTE_SELECT)
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[client-notes] failed to load notes', error);
    return NextResponse.json({ error: 'failed_to_load_notes' }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toPayload));
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const form = await req.formData();
  const text = String(form.get('text') ?? '').trim();
  if (!text) return NextResponse.json(null, { status: 204 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();
  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  let authorName = session?.user?.name ?? session?.user?.email ?? null;
  if (!authorName) {
    const { data: profile } = await sb.from('users').select('name,email').eq('id', meId).maybeSingle();
    authorName = profile?.name ?? profile?.email ?? null;
  }

  const insert = {
    client_id: id,
    author_id: meId,
    author_name: authorName,
    author_role: role,
    text,
  } satisfies Partial<NoteRow> & { client_id: string; text: string };

  const { data, error } = await sb.from('client_notes').insert(insert).select(NOTE_SELECT).single();
  if (error) {
    console.error('[client-notes] failed to insert note', error);
    return NextResponse.json({ error: 'failed_to_create_note' }, { status: 500 });
  }

  return NextResponse.json(toPayload(data as NoteRow), { status: 201 });
}
