// src/lib/validation/auth.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['CLIENT', 'TRAINER', 'ADMIN']).optional(),
});
