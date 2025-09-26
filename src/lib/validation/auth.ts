// src/lib/validation/auth.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome muito curto').max(80).optional(),
  role: z.enum(['CLIENT', 'TRAINER', 'ADMIN']).optional().default('CLIENT'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
