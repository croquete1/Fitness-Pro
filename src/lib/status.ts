// src/lib/status.ts
// Zero Prisma. Tipos locais e alinhados com o que guardas na BD (Supabase).

/** Tipo canónico da app para estados de utilizador/entidade */
export type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

/** Constantes runtime para evitar typos */
export const STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const;

/** Type guard: valida se o valor é um Status */
export function isStatus(v: unknown): v is Status {
  return v === STATUS.ACTIVE || v === STATUS.PENDING || v === STATUS.SUSPENDED;
}

/** Normaliza qualquer input (ex.: vindo da BD) para o nosso `Status` */
export function toStatus(value: unknown, fallback: Status = STATUS.PENDING): Status {
  const s = String(value ?? '').toUpperCase();

  // compat com legados
  if (s === 'APPROVED') return STATUS.ACTIVE;
  if (s === 'REJECTED') return STATUS.SUSPENDED;

  return isStatus(s) ? (s as Status) : fallback;
}

/** Label humano em PT */
export function statusLabel(s: Status): string {
  switch (s) {
    case STATUS.ACTIVE:
      return 'Ativo';
    case STATUS.PENDING:
      return 'Pendente';
    case STATUS.SUSPENDED:
      return 'Suspenso';
  }
}
