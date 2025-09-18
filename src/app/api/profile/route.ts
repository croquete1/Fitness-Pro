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
    phone, city, emergency_contact_name, emergency_contact_phone,
    goals, allergies, medical_notes, training_availability, injury_notes,
    certifications, specialties, hourly_rate, bio,
  } = body || {};

  const sb = createServerClient();

  // profiles
  try {
    await sb.from('profiles').upsert({
      id: uid, name: name ?? null, email: email ?? null, avatar_url: avatar_url ?? null,
      gender: gender ?? null, birthdate: birthdate ?? null, phone: phone ?? null, city: city ?? null,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'id' });
  } catch {}

  // metrics
  try {
    await sb.from('profile_metrics').upsert({
      user_id: uid,
      height_cm: height_cm === '' ? null : Number(height_cm),
      weight_kg: weight_kg === '' ? null : Number(weight_kg),
      bodyfat_pct: bodyfat_pct === '' ? null : Number(bodyfat_pct),
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'user_id' });
  } catch {}

  // details (opcional — só se a tabela existir)
  try {
    await sb.from('profile_details').upsert({
      user_id: uid,
      emergency_contact_name: emergency_contact_name ?? null,
      emergency_contact_phone: emergency_contact_phone ?? null,
      goals: goals ?? null,
      allergies: allergies ?? null,
      medical_notes: medical_notes ?? null,
      training_availability: training_availability ?? null,
      injury_notes: injury_notes ?? null,
      certifications: certifications ?? null,
      specialties: specialties ?? null,
      hourly_rate: hourly_rate === '' ? null : Number(hourly_rate),
      bio: bio ?? null,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'user_id' });
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

  // log admin
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
