// src/lib/auth.ts
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword, checkPassword } from '@/lib/hash';
import { RegisterSchema, LoginSchema } from '@/lib/validation/auth';

// Helpers de acesso
const sb = supabaseAdmin; // ⚠️ não é função

export type AuthLocalUser = {
  id: string;
  email: string;
  password_hash: string;
  created_at?: string;
};

export type Profile = {
  id?: string;
  email: string;
  name?: string | null;
  role: 'CLIENT' | 'TRAINER' | 'ADMIN';
  created_at?: string;
};

// Lê registo em auth_local_users por email
export async function findAuthLocalByEmail(email: string) {
  const { data, error } = await sb
    .from('auth_local_users')
    .select('id, email, password_hash, created_at')
    .eq('email', email)
    .maybeSingle<AuthLocalUser>();
  if (error) throw error;
  return data ?? null;
}

// Lê perfil por email
export async function findProfileByEmail(email: string) {
  const { data, error } = await sb
    .from('profiles')
    .select('id, email, name, role, created_at')
    .eq('email', email)
    .maybeSingle<Profile>();
  if (error) throw error;
  return data ?? null;
}

// Cria credencial local com password hash
export async function createAuthLocalUser(email: string, password: string) {
  const password_hash = await hashPassword(password);
  const { data, error } = await sb
    .from('auth_local_users')
    .insert({ email, password_hash })
    .select('id, email, password_hash, created_at')
    .maybeSingle<AuthLocalUser>();
  if (error) throw error;
  return data!;
}

// Upsert de perfil (mantém role e name sincronizados por email)
export async function upsertProfile(input: Pick<Profile, 'email' | 'name' | 'role'>) {
  const { data, error } = await sb
    .from('profiles')
    .upsert({ email: input.email, name: input.name ?? null, role: input.role }, { onConflict: 'email' })
    .select('id, email, name, role, created_at')
    .maybeSingle<Profile>();
  if (error) throw error;
  return data!;
}

// Registo “a sério”: valida, cria user local (hash) e perfil
export async function registerLocalUser(payload: z.infer<typeof RegisterSchema>) {
  const parsed = RegisterSchema.safeParse(payload);
  if (!parsed.success) {
    const err = parsed.error.format();
    return { ok: false as const, error: err };
  }
  const { email, password, name, role } = parsed.data;

  // já existe?
  const exists = await findAuthLocalByEmail(email);
  if (exists) return { ok: false as const, error: 'Email já registado.' };

  // cria credencial
  await createAuthLocalUser(email, password);

  // upsert perfil
  await upsertProfile({ email, name, role });

  return { ok: true as const };
}

// Verificação de credenciais (para usar onde precisares)
export async function verifyCredentialsLocal(payload: z.infer<typeof LoginSchema>) {
  const parsed = LoginSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const };

  const { email, password } = parsed.data;
  const cred = await findAuthLocalByEmail(email);
  if (!cred) return { ok: false as const };

  const ok = await checkPassword(password, cred.password_hash);
  if (!ok) return { ok: false as const };

  const prof = await findProfileByEmail(email);
  return {
    ok: true as const,
    user: {
      id: cred.id,
      email: cred.email,
      name: prof?.name ?? email.split('@')[0],
      role: (prof?.role ?? 'CLIENT') as Profile['role'],
    },
  };
}
