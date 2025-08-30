'use client';

import Link from 'next/link';

export default function AdminPlanShortcuts({
  baseId,
}: {
  baseId?: string; // se passares um id, mostra "Duplicar" também
}) {
  return (
    <div className="flex gap-2">
      <Link className="btn chip" href="/dashboard/pt/plans/new">➕ Novo plano</Link>
      {baseId && (
        <Link className="btn chip" href={`/dashboard/pt/plans/new?duplicate=${encodeURIComponent(baseId)}`}>
          🧬 Duplicar plano
        </Link>
      )}
    </div>
  );
}
