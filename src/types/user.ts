// src/types/user.ts
import type { AppRole } from '@/lib/roles';
export type { AppRole } from '@/lib/roles';

/** Status genérico de utilizador (DB/UI) */
export type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

/** Representação de utilizador para UI (datas serializadas em ISO) */
export type UiUser = {
  id: string;
  /** Opcional: alguns fluxos só têm email */
  name?: string | null;
  email: string;
  /** 'ADMIN' | 'PT' | 'CLIENT' (normalizado a partir do DB) */
  role: AppRole;
  status: Status;
  /** ISO string serializada (não Date) para evitar hydration issues */
  createdAt: string;
};

/** Representação simplificada de treinador para UI */
export type UiTrainer = {
  id: string;
  name?: string | null;
  email: string;
};

/** Registo de antropometria (datas em ISO) */
export type AnthropometryEntry = {
  id: string;
  takenAt: string;     // ISO
  weightKg?: number | null;
  heightCm?: number | null;
  bodyFatPct?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  thighCm?: number | null;
  armCm?: number | null;
  notes?: string | null;
};

/** Estado de subscrição de pacote/planos */
export type PackageStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export type PackageSubscription = {
  id: string;
  name: string;
  status: PackageStatus;
  startedAt: string;          // ISO
  endsAt: string | null;      // ISO
};

/** Resumo de plano de treino (UI) */
export type TrainingPlanSummary = {
  id: string;
  title: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  updatedAt?: string;         // ISO
};

/** Nota interna (tipicamente privada ao PT) */
export type Note = {
  id: string;
  createdAt: string;          // ISO
  author: string;             // nome do PT
  text: string;
  /** true para nota privada; ajustar para boolean se precisares de públicos/privados */
  private: true;
};

/** Resumo de sessão (agenda) */
export type SessionSummary = {
  id: string;
  startsAt: string;           // ISO
  durationMin: number;
  title: string;
  location?: string | null;
};
