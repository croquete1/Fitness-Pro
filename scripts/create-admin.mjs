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

const email = process.argv[2] ?? 'admin@example.com';
const password = process.argv[3] ?? 'Admin123!';
const name = process.argv[4] ?? 'Administrador';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const userRes = await supabase.auth.admin.getUserByEmail(email);
if (!userRes.data?.user) {
  const createRes = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (createRes.error) {
    console.error('❌ Falha ao criar utilizador:', createRes.error.message);
    process.exit(1);
  }
  console.log('✅ Utilizador criado:', createRes.data.user.id);
}

const profileRes = await supabase
  .from('users')
  .upsert(
    {
      email,
      role: 'ADMIN',
      status: 'ACTIVE',
      approved: true,
      name,
    },
    { onConflict: 'email' }
  );

if (profileRes.error) {
  console.error('❌ Falha ao atualizar perfil:', profileRes.error.message);
  process.exit(1);
}

console.log('✅ Perfil/role atualizado para ADMIN.');
