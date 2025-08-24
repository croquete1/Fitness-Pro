// src/app/(app)/dashboard/admin/roles/page.tsx
import { requireAdmin } from '@/lib/authz'; // se já tiveres; senão remove a linha
import Link from 'next/link';

export default async function Page() {
  // opcional: await requireAdmin();
  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Perfis & permissões</h1>
      <p style={{ marginBottom: 12 }}>Gestão de papéis (Admin, PT, Cliente) e respetivas permissões.</p>

      <ul style={{ lineHeight: 1.9 }}>
        <li><strong>Admin</strong> – acesso total à plataforma.</li>
        <li><strong>Personal Trainer</strong> – gestão de planos, clientes atribuídos, aulas.</li>
        <li><strong>Cliente</strong> – acesso ao próprio plano, aulas e pagamentos.</li>
      </ul>

      <div style={{ marginTop: 16 }}>
        <Link className="btn" href="/dashboard/admin/users">Ir para Utilizadores</Link>
      </div>
    </div>
  );
}
