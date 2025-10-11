import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { syncUserProfile } from '@/lib/profileSync';

type SessionUser = { id?: string };
type SessionLike = { user?: SessionUser } | null;

export const runtime = 'nodejs'; // garante FormData/File

export async function POST(req: Request) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return new NextResponse('No file', { status: 400 });

  const sb = createServerClient();

  const path = `${user.id}/${Date.now()}.jpg`;
  const { error: upErr } = await sb.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (upErr) return new NextResponse(upErr.message, { status: 500 });

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publicUrl = `${base}/storage/v1/object/public/avatars/${encodeURIComponent(path)}`;

  const result = await syncUserProfile(sb, user.id, { avatar_url: publicUrl });
  if (!result.ok) return new NextResponse(result.error, { status: 500 });

  return NextResponse.json({ ok: true, avatar_url: publicUrl });
}
