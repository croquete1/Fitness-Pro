import type { Metadata } from 'next';
import { brand } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Área do Personal Trainer · ${brand.name}`,
  description: 'Zona reservada a Personal Trainers e administradores para gerir treinos e clientes.',
};

export default async function TrainerPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Área do Personal Trainer</h1>
      <p className="text-sm opacity-70">
        Conteúdo reservado a Personal Trainers e administradores. (Secção em construção — adiciona aqui a tua UI de treinos.)
      </p>
    </main>
  );
}
