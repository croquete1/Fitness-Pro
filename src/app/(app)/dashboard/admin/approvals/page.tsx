// src/app/(app)/dashboard/admin/approvals/page.tsx
export const dynamic = 'force-dynamic';

export default function ApprovalsPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Aprovações</h1>
      <p>Lista de contas pendentes para aprovação.</p>
      {/* TODO: tabela real quando ligares à API */}
    </div>
  );
}
