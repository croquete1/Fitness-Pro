import { NextResponse } from 'next/server';
import { AUDIT_TABLE_CANDIDATES, isMissingAuditTableError } from '@/lib/audit';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { computeDashboard } from '@/lib/admin/audit-log/dashboard';
import type { AdminAuditDashboardData, AuditLogRow } from '@/lib/admin/audit-log/types';
import { ADMIN_AUDIT_DASHBOARD_FALLBACK } from '@/lib/fallback/admin-audit-log';

export type AuditDashboardResponse = AdminAuditDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
  missingTable?: boolean;
};

export async function GET() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') {
    return NextResponse.json({ ok: false, message: 'Sem permissões.' }, { status: 403 });
  }

  const sb = createServerClient();
  const now = new Date();
  const lookback = new Date(now.getTime() - 45 * 86_400_000).toISOString();
  let lastMissing = false;

  for (const table of AUDIT_TABLE_CANDIDATES) {
    try {
      const { data, error } = await sb
        .from(table as any)
        .select(
          'id, created_at, kind, category, action, target_type, target_id, target, actor_id, actor, note, details, payload, meta, ip, user_agent',
        )
        .gte('created_at', lookback)
        .order('created_at', { ascending: false })
        .limit(750);

      if (error) {
        if (isMissingAuditTableError(error)) {
          lastMissing = true;
          continue;
        }
        throw error;
      }

      const rows = (data ?? []) as AuditLogRow[];
      const dashboard = computeDashboard(rows, now);
      return NextResponse.json({
        ...dashboard,
        ok: true,
        source: 'supabase',
        missingTable: false,
      } satisfies AuditDashboardResponse);
    } catch (error) {
      if (isMissingAuditTableError(error)) {
        lastMissing = true;
        continue;
      }
      console.error('[audit-log][dashboard] erro inesperado', error);
      break;
    }
  }

  return NextResponse.json({
    ...ADMIN_AUDIT_DASHBOARD_FALLBACK,
    ok: true,
    source: 'fallback',
    missingTable: lastMissing,
  } satisfies AuditDashboardResponse);
}
