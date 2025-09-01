// src/components/wallet/WalletRowBadges.tsx
'use client';

import MiniSpark from '@/components/ui/MiniSpark';
import { DeltaBadge, ProgressBadge } from '@/components/ui/Badges';

export default function WalletRowBadges({
  sessionsDone,
  sessionsPlanned,
  adherenceTrend, // ex.: nº de sessões por semana nas últimas N semanas
  priceDelta,     // ex.: preço atual vs. anterior (para packs renovados)
  prevPrice,
}: {
  sessionsDone: number;
  sessionsPlanned: number;
  adherenceTrend?: (number | null | undefined)[];
  priceDelta?: number | null;
  prevPrice?: number | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <ProgressBadge done={sessionsDone} total={sessionsPlanned} compact />
      {adherenceTrend && adherenceTrend.length > 1 ? (
        <MiniSpark
          points={adherenceTrend}
          goodWhen="up"
          width={120}
          height={34}
          title="Assiduidade"
        />
      ) : null}
      <div className="text-xs opacity-80">
        Preço:
        <DeltaBadge
          now={priceDelta ?? null}
          prev={prevPrice ?? null}
          unit="€"
          goodWhen="up"
        />
      </div>
    </div>
  );
}