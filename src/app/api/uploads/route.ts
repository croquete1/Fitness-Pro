// src/app/api/uploads/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs'; // garante acesso a APIs de fs/streams no server

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Ficheiro ausente. Envie o campo "file" no form-data.' }, { status: 400 });
  }

  // Nome único
  const ext = file.name.split('.').pop() || 'bin';
  const key = `u/${encodeURIComponent(session.user.email)}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload para bucket "uploads"
  const arrayBuffer = await file.arrayBuffer();
  const { data, error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(key, Buffer.from(arrayBuffer), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    const msg = error.message?.includes('bucket not found')
      ? 'Bucket "uploads" não existe. Cria-o no Supabase Storage.'
      : 'Falha no upload.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Gera URL pública (se bucket estiver como public)
  const { data: pubUrl } = supabaseAdmin.storage.from('uploads').getPublicUrl(data.path);

  return NextResponse.json({
    ok: true,
    path: data.path,
    url: pubUrl?.publicUrl || null,
  }, { status: 201 });
}

export function GET() {
  // opcional: poderias listar uploads do utilizador
  return NextResponse.json({ ok: true, hint: 'Use POST multipart/form-data com campo "file".' });
}
