export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { AUDIT_TABLE_CANDIDATES, isMissingAuditTableError } from '@/lib/audit';

type AuditLog = {
  id: string;
  created_at: string | null;
  actor_id: string | null;
  action: string | null;
  details: Record<string, unknown> | null;
};

export default async function AdminAccountLogsPage() {
  const session = await getSessionUserSafe();
  const me = (session as any)?.user;
  if (!me?.id) redirect('/login' as Route);

  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();

  let rows: AuditLog[] = [];
  for (const table of AUDIT_TABLE_CANDIDATES) {
    try {
      const { data, error } = await sb
        .from(table as any)
        .select('id, created_at, actor_id, action, details')
        .ilike('category', 'account%')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        if (isMissingAuditTableError(error)) continue;
      } else if (data) {
        rows = data as AuditLog[];
      }
      break;
    } catch (err) {
      if (isMissingAuditTableError(err)) continue;
      break;
    }
  }

  return (
    <main className="p-4 space-y-4">
      <PageHeader
        title="Registos de Conta"
        subtitle="Alterações de conta e perfis dos utilizadores"
      />
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted">Sem registos para mostrar.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Quando</th>
                    <th>Utilizador</th>
                    <th>Ação</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                      <td>{r.actor_id ?? '—'}</td>
                      <td>
                        <Badge variant="neutral">{r.action ?? '—'}</Badge>
                      </td>
                      <td>
                        <pre className="text-xs whitespace-pre-wrap">
                          {r.details ? JSON.stringify(r.details, null, 2) : '—'}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3">
            <Link href={'/dashboard/admin' as Route} className="btn chip">← Voltar</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
