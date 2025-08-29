// src/lib/status.ts
import { Status } from '@prisma/client';

/** Converte valores (ex.: strings do Supabase) para o enum do Prisma */
export function toStatus(value: unknown, fallback: Status = Status.PENDING): Status {
  const s = String(value ?? '').toUpperCase();
  switch (s) {
    case 'ACTIVE': return Status.ACTIVE;
    case 'PENDING': return Status.PENDING;
    case 'SUSPENDED': return Status.SUSPENDED;
    // compat com legados
    case 'APPROVED': return Status.ACTIVE;
    case 'REJECTED': return Status.SUSPENDED;
    default: return fallback;
  }
}

export function statusLabel(s: Status): string {
  switch (s) {
    case Status.ACTIVE: return 'Ativo';
    case Status.PENDING: return 'Pendente';
    case Status.SUSPENDED: return 'Suspenso';
  }
}
