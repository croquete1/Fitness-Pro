import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type Body = {
  username?: string | null;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  gender?: string | null;
  dob?: string | null; // ISO date
  height_cm?: number | null;
  weight_kg?: number | null;
};

function cleanStr(s: unknown) {
  return typeof s === 'string' ? s.trim() : null;
}

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const sb = createServerClient();
  const uid = session.user.id;
  const role = toAppRole(session.user.role) ?? 'CLIENT';

  let body: Body = {};
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  // Carregar estado “antes” para diff
  const { data: beforeUser } = await sb.from('users')
    .select('id, username, name, email, role')
    .eq('id', uid)
    .maybeSingle();
  const { data: beforeProf } = await sb.from('profiles')
    .select('avatar_url, gender, dob, height_cm, weight_kg')
    .eq('id', uid)
    .maybeSingle();

  const updatesUsers: any = {};
  const updatesProfiles: any = {};

  if (body.username != null) updatesUsers.username = cleanStr(body.username);
  if (body.name != null) updatesUsers.name = cleanStr(body.name);
  if (body.email != null) updatesUsers.email = cleanStr(body.email);

  if (body.avatar_url !== undefined) updatesProfiles.avatar_url = cleanStr(body.avatar_url);
  if (body.gender !== undefined) updatesProfiles.gender = cleanStr(body.gender);
  if (body.dob !== undefined) updatesProfiles.dob = cleanStr(body.dob);
  if (body.height_cm !== undefined) updatesProfiles.height_cm = typeof body.height_cm === 'number' ? body.height_cm : null;
  if (body.weight_kg !== undefined) updatesProfiles.weight_kg = typeof body.weight_kg === 'number' ? body.weight_kg : null;

  // Validar username se mudou
  if (updatesUsers.username && updatesUsers.username !== beforeUser?.username) {
    const { data: check } = await sb
      .from('users')
      .select('id')
      .ilike('username', updatesUsers.username)
      .neq('id', uid)
      .limit(1);
    if ((check ?? []).length) {
      return NextResponse.json({ ok: false, field: 'username', reason: 'taken' }, { status: 409 });
    }
  }

  // Executar updates
  try {
    if (Object.keys(updatesUsers).length) {
      await sb.from('users').update(updatesUsers).eq('id', uid);
    }
    if (Object.keys(updatesProfiles).length) {
      const { data: exists } = await sb.from('profiles').select('id').eq('id', uid).maybeSingle();
      if (exists?.id) {
        await sb.from('profiles').update(updatesProfiles).eq('id', uid);
      } else {
        await sb.from('profiles').insert({ id: uid, ...updatesProfiles });
      }
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // diff simples para audit
  const diff: Record<string, { from: any; to: any }> = {};
  function addDiff(key: string, fromV: any, toV: any) {
    if (toV !== undefined && fromV !== toV) diff[key] = { from: fromV ?? null, to: toV ?? null };
  }

  addDiff('username', beforeUser?.username, updatesUsers.username ?? beforeUser?.username);
  addDiff('name', beforeUser?.name, updatesUsers.name ?? beforeUser?.name);
  addDiff('email', beforeUser?.email, updatesUsers.email ?? beforeUser?.email);
  addDiff('avatar_url', beforeProf?.avatar_url, updatesProfiles.avatar_url ?? beforeProf?.avatar_url);
  addDiff('gender', beforeProf?.gender, updatesProfiles.gender ?? beforeProf?.gender);
  addDiff('dob', beforeProf?.dob, updatesProfiles.dob ?? beforeProf?.dob);
  addDiff('height_cm', beforeProf?.height_cm, updatesProfiles.height_cm ?? beforeProf?.height_cm);
  addDiff('weight_kg', beforeProf?.weight_kg, updatesProfiles.weight_kg ?? beforeProf?.weight_kg);

  try {
    await sb.from('audit_log').insert({
      actor_id: uid,
      target_id: uid,
      action: 'PROFILE_UPDATE',
      meta: { diff },
    });
  } catch {}

  // Notificar PT(s) atribuídos se o autor for CLIENT
  if (role === 'CLIENT') {
    try {
      const { data: links } = await sb
        .from('trainer_clients')
        .select('trainer_id')
        .eq('client_id', uid);

      const trainers = (links ?? []).map((l: any) => l.trainer_id).filter(Boolean);
      if (trainers.length) {
        const { data: me } = await sb.from('users').select('name,email').eq('id', uid).maybeSingle();
        const title = 'Atualização de perfil';
        const body = `${me?.name ?? me?.email ?? 'Cliente'} atualizou os seus dados.`;
        const rows = trainers.map((tid: string) => ({
          user_id: tid,
          title,
          body,
          read: false,
          href: '/dashboard/clients', // podes ajustar para uma rota detalhada
        }));
        await sb.from('notifications').insert(rows);
      }
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
