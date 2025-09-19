import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ ok: false, error: 'no_file' }, { status: 400 });

    const sb = createServerClient();
    const uid = session.user.id;
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${uid}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: upErr } = await sb.storage.from('avatars').upload(path, Buffer.from(arrayBuffer), {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });
    if (upErr) return NextResponse.json({ ok: false, error: 'upload_failed' }, { status: 500 });

    const { data: pub } = sb.storage.from('avatars').getPublicUrl(path);
    const url = pub.publicUrl;

    // opcional: atualizar logo o perfil com o novo URL
    await sb.from('profiles').upsert({ id: uid, avatar_url: url }, { onConflict: 'id' });

    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}
