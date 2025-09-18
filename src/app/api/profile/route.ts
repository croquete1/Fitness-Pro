import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function PATCH(req: NextRequest) {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    name, email, avatar_url, gender, birthdate,
    height_cm, weight_kg, bodyfat_pct,
  } = body || {};

  const sb = createServerClient();

  // update profiles
  try {
    await sb.from('profiles').upsert({
      id: uid,
      name: name ?? null,
      email: email ?? null,
      avatar_url: avatar_url ?? null,
      gender: gender ?? null,
      birthdate: birthdate ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  } catch {}

  // update anthropometrics
  try {
    await sb.from('profile_metrics').upsert({
      user_id: uid,
      height_cm: height_cm === '' ? null : Number(height_cm),
      weight_kg: weight_kg === '' ? null : Number(weight_kg),
      bodyfat_pct: bodyfat_pct === '' ? null : Number(bodyfat_pct),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch {}

  // notificar PT(s) atribuídos
  try {
    const { data: links } = await sb.from('trainer_clients').select('trainer_id').eq('client_id', uid);
    const trainerIds = (links ?? []).map((x: any) => x.trainer_id).filter(Boolean);
    if (trainerIds.length) {
      await sb.from('notifications').insert(
        trainerIds.map((tid: string) => ({
          user_id: tid,
          title: 'Atualização de perfil do cliente',
          body: 'Um cliente atualizou os dados do perfil.',
          read: false,
        }))
      );
    }
  } catch {}

  // log para admins
  try {
    await sb.from('admin_logs').insert({
      actor_id: uid,
      action: 'PROFILE_UPDATE',
      payload: { fields: Object.keys(body || {}) },
      created_at: new Date().toISOString(),
    } as any);
  } catch {}

  return NextResponse.json({ ok: true });
}
