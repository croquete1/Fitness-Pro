// src/app/api/admin/users/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export const runtime = 'nodejs';

/**
 * POST /api/admin/users/approve
 * Body: { id?: string; email?: string; sendInvite?: boolean; sendReset?: boolean; redirectTo?: string }
 * - Aprova o utilizador local (approved/ACTIVE/is_active)
 * - Garante existência em Supabase Auth (convida se não existir)
 * - (Opcional) Envia email de reset de password
 */
export async function POST(req: NextRequest) {
  // 0) Authz: ADMIN only
  const session = await getServerSession(authOptions);
  const actorRole = String((session?.user as any)?.role ?? '').toUpperCase();
  const actorId = (session?.user as any)?.id as string | undefined;

  if (!session || actorRole !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  // 1) Inputs
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    email?: string;
    sendInvite?: boolean;
    sendReset?: boolean;
    redirectTo?: string;
  };

  const sendInvite = body.sendInvite ?? true;  // por omissão, convidar se não existir
  const sendReset  = body.sendReset  ?? false; // por omissão, não forçar reset
  const sb = createServerClient();

  // Descobrir appUrl para links
  const defaultOrigin = (() => {
    try { return new URL(req.url).origin; } catch { return ''; }
  })();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || defaultOrigin || '';
  const redirectTo = body.redirectTo || (appUrl ? `${appUrl}/login/reset` : undefined);

  // 2) Carregar utilizador local por id/email
  const findLocalBy = async () => {
    if (body.id) {
      const { data } = await sb.from('users')
        .select('id, email, name, role, status, approved, is_active, auth_user_id')
        .eq('id', body.id)
        .limit(1);
      return data?.[0] ?? null;
    }
    if (body.email) {
      const { data } = await sb.from('users')
        .select('id, email, name, role, status, approved, is_active, auth_user_id')
        .ilike('email', body.email)
        .limit(1);
      return data?.[0] ?? null;
    }
    return null;
  };

  const local = await findLocalBy();
  if (!local) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
  }
  const targetEmail = String(local.email ?? body.email ?? '').trim().toLowerCase();
  if (!targetEmail) {
    return NextResponse.json({ error: 'EMAIL_REQUIRED' }, { status: 422 });
  }

  // 3) Aprovar/ativar no schema local
  {
    const { error: upErr } = await sb.from('users').update({
      approved: true,
      is_active: true,
      status: 'ACTIVE',
    }).eq('id', local.id);
    if (upErr) {
      return NextResponse.json({ error: 'LOCAL_UPDATE_FAILED', detail: upErr.message }, { status: 500 });
    }
  }

  // 4) Garantir existência no Supabase Auth
  //    Estratégia: tentar gerar link de recovery (se existe → retorna user);
  //    caso contrário, convidar (ou criar) utilizador.
  let authUserId: string | undefined = local.auth_user_id ?? undefined;
  try {
    const { data, error } = await sb.auth.admin.generateLink({
      type: 'recovery',
      email: targetEmail,
      options: redirectTo ? { redirectTo } : undefined,
    } as any);
    if (!error && data?.user) {
      authUserId = data.user.id;
    } else if (sendInvite) {
      // não existe → convidar
      const { data: inv, error: invErr } = await sb.auth.admin.inviteUserByEmail(
        targetEmail, redirectTo ? { redirectTo } : undefined
      );
      if (!invErr && inv?.user) {
        authUserId = inv.user.id;
      } else {
        // fallback: tentar createUser (confirmação de email automática)
        const { data: cu, error: cuErr } = await sb.auth.admin.createUser({
          email: targetEmail,
          email_confirm: false,
        } as any);
        if (!cuErr && cu?.user) authUserId = cu.user.id;
      }
    }
  } catch {
    /* ignore */
  }

  // 5) Atualizar ligação local -> auth_user_id (se obtivemos)
  if (authUserId && authUserId !== local.auth_user_id) {
    await sb.from('users').update({ auth_user_id: authUserId }).eq('id', local.id);
  }

  // 6) (Opcional) Enviar email de reset para definir password
  if (sendReset) {
    try {
      // ✅ Supabase v2: resetPasswordForEmail está em `auth`, não em `auth.admin`
      await sb.auth.resetPasswordForEmail(
        targetEmail,
        redirectTo ? { redirectTo } : undefined
      );
    } catch {
      /* ignore */
    }
  }

  // 7) Auditoria (tolerante)
  try {
    await logAudit({
      kind: AUDIT_KINDS.USER_APPROVE,
      targetType: AUDIT_TARGET_TYPES.USER,
      targetId: local.id,
      actorId: actorId ?? null,
      message: `Aprovação de utilizador ${targetEmail} (auth=${authUserId ? 'yes' : 'no'})`,
      details: { authUserId, sendInvite, sendReset, redirectTo }
    });
  } catch { /* no-op */ }

  return NextResponse.json({
    ok: true,
    user: {
      id: local.id,
      email: targetEmail,
      auth_user_id: authUserId ?? null,
      approved: true,
      is_active: true,
      status: 'ACTIVE',
    }
  });
}
