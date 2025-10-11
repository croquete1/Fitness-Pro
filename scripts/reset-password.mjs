#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL ou chave de serviço em falta.');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Uso: node scripts/reset-password.mjs <email> <nova-password>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const userRes = await supabase.auth.admin.getUserByEmail(email);
if (userRes.error || !userRes.data?.user) {
  console.error('❌ Utilizador não encontrado.');
  process.exit(1);
}

const updateRes = await supabase.auth.admin.updateUserById(userRes.data.user.id, {
  password,
});

if (updateRes.error) {
  console.error('❌ Falha ao atualizar password:', updateRes.error.message);
  process.exit(1);
}

console.log('✅ Password atualizada com sucesso.');
