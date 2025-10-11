// src/lib/validation/auth.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z
    .string()
    .min(1)
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, {
      message: 'Identificador obrigatório',
    }),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  // se a tua tabela tiver 'role', podes aceitar aqui e enviar no insert
  role: z.enum(['CLIENT','TRAINER','ADMIN']).optional(),
});
