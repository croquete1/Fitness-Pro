// src/app/api/_memdb.ts
/* Memória em processo para desenvolvimento. Em produção,
   substitui os "TODO Prisma" dentro dos endpoints. */

export type AnthropometryEntry = {
  id: string;
  takenAt: string;
  weightKg?: number | null;
  bodyFatPct?: number | null;
  heightCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  thighCm?: number | null;
  armCm?: number | null;
  notes?: string | null;
};

export type PackageSubscription = {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  endsAt?: string | null;
};

export type TrainingPlanSummary = {
  id: string;
  title: string;
  status?: string | null;
  updatedAt?: string | null;
};

export type Note = { id: string; createdAt: string; author: string; text: string };
export type SessionSummary = {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  location?: string | null;
};

type MemDB = {
  anthrop: Map<string, AnthropometryEntry[]>;
  packages: Map<string, { current: PackageSubscription | null; history: PackageSubscription[] }>;
  plans: Map<string, TrainingPlanSummary[]>;
  notes: Map<string, Note[]>;
  sessions: Map<string, SessionSummary[]>;
  trainerLinks: Map<string, Set<string>>; // clientId -> Set<trainerId>
  trainers: Map<string, string>; // trainerId -> trainerName
};

declare global {
  // eslint-disable-next-line no-var
  var __MEMDB__: MemDB | undefined;
}

export const mem = (globalThis.__MEMDB__ ??= {
  anthrop: new Map(),
  packages: new Map(),
  plans: new Map(),
  notes: new Map(),
  sessions: new Map(),
  trainerLinks: new Map(),
  trainers: new Map([
    ['t1', 'João Silva'],
    ['t2', 'Maria Costa'],
    ['t3', 'Alex Rocha'],
  ]),
} satisfies MemDB);

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify({ ok: true, data }), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

export function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
