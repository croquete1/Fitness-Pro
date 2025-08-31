// src/app/(app)/dashboard/users/[id]/page.tsx
import Link from 'next/link';
import AnthropometryForm from '@/components/client/AnthropometryForm';
import AnthropometryHistory from '@/components/client/AnthropometryHistory';
import { getSessionUser } from '@/lib/sessions';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function UserShowPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const viewer = await getSessionUser(); // quem está logado
  const canEdit = !!viewer && (viewer.role === Role.ADMIN || viewer.role === Role.TRAINER);

  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  if (!u) {
    return <div className="card" style={{ padding: 16 }}>Utilizador não encontrado.</div>;
  }

  return (
    <div className="grid" style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
        <h1 style={{ margin: 0 }}>{u.name ?? 'Utilizador'}</h1>

        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div><strong>Email:</strong> {u.email}</div>
            <div><strong>Telefone:</strong> —</div>
            <div><strong>Role:</strong> <span className="chip">{u.role}</span></div>
            <div><strong>Estado:</strong> <span className="chip">{u.status}</span></div>
            <div><strong>Criado:</strong> {new Date(u.createdAt).toLocaleString('pt-PT')}</div>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {u.role !== Role.CLIENT && (
                <Link className="btn chip" href={`/dashboard/pt?user=${u.id}`}>Ver planos de treino</Link>
              )}
              <Link className="btn chip" href={`/dashboard/search?q=${encodeURIComponent(u.email ?? u.name ?? '')}`}>
                Procurar relacionados
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 🔽 Formulário (só PT/Admin) */}
      {canEdit && (
        <AnthropometryForm clientId={u.id} canEdit={canEdit} />
      )}

      {/* 🔽 Histórico (todos vêem) */}
      <AnthropometryHistory clientId={u.id} />
    </div>
  );
}
