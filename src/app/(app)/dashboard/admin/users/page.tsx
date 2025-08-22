// src/app/(app)/dashboard/admin/users/page.tsx
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Utilizadores</h1>
      <p>Gestão de utilizadores.</p>
      {/* TODO: tabela real quando ligares à API */}
    </div>
  );
}
