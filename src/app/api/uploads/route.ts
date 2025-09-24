// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

function extFromType(type?: string | null, name?: string | null) {
  if (name && name.includes('.')) return name.split('.').pop()!;
  if (!type) return 'bin';
  const m = type.split('/')[1];
  return m || 'bin';
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ ok: false, error: 'UNAUTH' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const bucket = String(form.get('bucket') || 'media'); // cria este bucket no Supabase
  const folder = String(form.get('folder') || 'uploads');

  if (!file) return NextResponse.json({ ok: false, error: 'NO_FILE' }, { status: 400 });

  const sb = createServerClient();

  const ext = extFromType(file.type, file.name);
  const now = new Date();
  const path = `${me.id}/${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await sb.storage.from(bucket).upload(path, new Uint8Array(arrayBuffer), {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

  // Signed URL curto para preview
  const { data: signed } = await sb.storage.from(bucket).createSignedUrl(path, 60 * 10); // 10 min
  return NextResponse.json({ ok: true, path, signedUrl: signed?.signedUrl ?? null });
}
