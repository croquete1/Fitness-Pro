// src/app/(app)/dashboard/admin/approvals/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ApprovalsClient from '@/components/admin/ApprovalsClient';
import { listPendingApprovals } from '@/lib/admin/approvalsRepo';

export const dynamic = 'force-dynamic';

export default async function AdminApprovalsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role?.toUpperCase?.() ?? 'CLIENT';

  if (role !== 'ADMIN') {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Aprovações</h1>
        <p style={{ color: 'var(--muted)' }}>Acesso restrito ao administrador.</p>
      </div>
    );
  }

  const items = await listPendingApprovals();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 28 }}>Aprovações</h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          Gerir pedidos de conta pendentes. (carregamento server-side, sem fetch relativo)
        </p>
      </header>
      <ApprovalsClient initial={items} />
    </div>
  );
}
