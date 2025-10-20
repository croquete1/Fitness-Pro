export type AdminWeekSessionRow = {
  id: string;
  name: string;
  sessions: number;
  nextAt: string | null;
};

type Options = {
  limit?: number;
  now?: Date;
};

const FALLBACK_ROWS: Array<{
  id: string;
  name: string;
  sessions: number;
  nextMinutes: number | null;
}> = [
  { id: 'pt-ricardo-duarte', name: 'Ricardo Duarte', sessions: 19, nextMinutes: 95 },
  { id: 'pt-ana-ribeiro', name: 'Ana Ribeiro', sessions: 17, nextMinutes: 190 },
  { id: 'pt-sofia-carvalho', name: 'Sofia Carvalho', sessions: 15, nextMinutes: 260 },
  { id: 'pt-miguel-ferreira', name: 'Miguel Ferreira', sessions: 14, nextMinutes: 45 },
  { id: 'pt-inês-almeida', name: 'Inês Almeida', sessions: 13, nextMinutes: 320 },
  { id: 'pt-julia-marques', name: 'Júlia Marques', sessions: 11, nextMinutes: 410 },
  { id: 'pt-daniel-sousa', name: 'Daniel Sousa', sessions: 9, nextMinutes: 520 },
  { id: 'pt-catarina-lopes', name: 'Catarina Lopes', sessions: 8, nextMinutes: null },
];

export function buildFallbackAdminWeekSessions({ limit = 8, now = new Date() }: Options = {}) {
  const base = new Date(now);
  const rows: AdminWeekSessionRow[] = FALLBACK_ROWS.slice(0, limit).map((row) => {
    const nextAt =
      row.nextMinutes === null
        ? null
        : new Date(base.getTime() + row.nextMinutes * 60_000).toISOString();
    return {
      id: row.id,
      name: row.name,
      sessions: row.sessions,
      nextAt,
    } satisfies AdminWeekSessionRow;
  });

  return {
    rows,
    generatedAt: base.toISOString(),
  };
}
