import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PTLibraryClient from './PTLibraryClient';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export const metadata: Metadata = { title: 'Biblioteca de exercícios' };

export default async function LibraryPtPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Biblioteca de exercícios</h1>
        <p className="text-sm text-muted-foreground">
          Mantém os teus exercícios organizados, personaliza o catálogo global e reutiliza-os rapidamente nos planos de treino.
        </p>
      </header>
      <PTLibraryClient />
    </section>
  );
}
