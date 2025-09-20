import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Ficheiro em falta' }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Máx. 8MB' }, { status: 400 });

  const sb = createServerClient();
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${session.user.id}/${Date.now()}.${ext}`;

  const { error: upErr } = await sb.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'image/png',
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  const { data: pub } = sb.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = pub?.publicUrl ?? null;

  if (avatarUrl) {
    await sb.from('profiles').update({ avatar_url: avatarUrl }).eq('id', session.user.id);
  }

  return NextResponse.json({ ok: true, url: avatarUrl });
}

export async function DELETE() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();
  await sb.from('profiles').update({ avatar_url: null }).eq('id', session.user.id);
  // (Opcional) também poderias apagar ficheiros antigos do bucket aqui.
  return NextResponse.json({ ok: true });
}
