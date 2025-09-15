// src/app/(app)/dashboard/admin/approvals/page.tsx
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar from '@/components/ui/Toolbar';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

// Tabelas alinhadas:
// - public.users(id, name, email, role, status, created_at)
type DbRole = 'ADMIN' | 'PT' | 'TRAINER' | 'CLIENT' | string;
type DbStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'APPROVED' | string;

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: DbRole;
  status: DbStatus;
  created_at: string | null;
};

type Row = {
  id: string;
  name: string | null;
  email: string;
  role: DbRole;
  status: DbStatus;
  createdAt: string; // ISO
};

function mapRoleBadge(role: DbRole) {
  if (role === 'ADMIN') return { variant: 'info' as const, label: 'ADMIN' };
  if (role === 'PT' || role === 'TRAINER') return { variant: 'primary' as const, label: 'PT' };
  return { variant: 'neutral' as const, label: 'CLIENT' };
}

export default async function ApprovalsPage() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');
  const role = (toAppRole(user?.role) ?? 'CLIENT') as 'ADMIN' | 'PT' | 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data, error } = await sb
    .from('users')
    .select('id, name, email, role, status, created_at')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(200)
    .returns<UserRow[]>(); // <- TIPAGEM CORRETA

  if (error) {
    // Loga se quiseres; não quebra a UI
    // console.error(error);
  }

  const rows: Row[] = (data ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: (u.created_at ? new Date(u.created_at) : new Date()).toISOString(),
  }));

  return (
    <div className="grid gap-4 p-4 md:p-6">
      <PageHeader title="✅ Aprovações" subtitle="Revê e aprova novas contas pendentes." />
      <Toolbar
        left={<span className="text-sm opacity-80">Pendentes: <strong>{rows.length}</strong></span>}
        right={
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            Ir a Utilizadores
          </Link>
        }
      />
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <div className="py-8 text-center text-slate-500">Não há registos pendentes.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Nome</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Criado</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const rb = mapRoleBadge(r.role);
                    return (
                      <tr key={r.id} className="border-t border-slate-200/70 dark:border-slate-800/70">
                        <td className="px-3 py-3 font-semibold">{r.name ?? '—'}</td>
                        <td className="px-3 py-3">{r.email}</td>
                        <td className="px-3 py-3"><Badge variant={rb.variant}>{rb.label}</Badge></td>
                        <td className="px-3 py-3"><Badge variant="warning">{r.status}</Badge></td>
                        <td className="px-3 py-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-3 text-right">
                          <Link
                            href={`/dashboard/admin/users/${r.id}`}
                            className="inline-flex items-center rounded-lg border px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
