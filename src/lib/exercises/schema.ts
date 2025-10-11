import { z } from 'zod';

export const DIFFICULTY_OPTIONS = ['Fácil', 'Média', 'Difícil'] as const;

export type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];

export type ExerciseFormValues = {
  id?: string;
  name: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: Difficulty;
  description?: string;
  video_url?: string;
};

export const ExerciseFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome muito curto'),
  muscle_group: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ?? '') || undefined),
  equipment: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ?? '') || undefined),
  difficulty: z
    .enum(DIFFICULTY_OPTIONS)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ?? '') || undefined),
  video_url: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ?? '') || undefined)
    .refine((v) => !v || /^https?:\/\//i.test(v), { message: 'URL deve começar por http(s)://' }),
});

export function normalizeDifficulty(v?: string | null): Difficulty | undefined {
  if (!v) return undefined;
  const s = v.toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  if (s.startsWith('fac')) return 'Fácil';
  if (s.startsWith('med')) return 'Média';
  if (s.startsWith('dif')) return 'Difícil';
  return undefined;
}
