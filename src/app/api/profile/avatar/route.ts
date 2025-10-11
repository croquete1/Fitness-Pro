import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { syncUserProfile } from '@/lib/profileSync';

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
    const result = await syncUserProfile(sb, session.user.id, { avatar_url: avatarUrl });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: avatarUrl });
}

export async function DELETE() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();
  const result = await syncUserProfile(sb, session.user.id, { avatar_url: null });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  // (Opcional) também poderias apagar ficheiros antigos do bucket aqui.
  return NextResponse.json({ ok: true });
}
