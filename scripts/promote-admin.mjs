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
if (!email) {
  console.error('Uso: node scripts/promote-admin.mjs <email>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const profileRes = await supabase
  .from('users')
  .update({ role: 'ADMIN', approved: true })
  .eq('email', email)
  .select('id')
  .maybeSingle();

if (profileRes.error) {
  console.error('❌ Falha ao promover utilizador:', profileRes.error.message);
  process.exit(1);
}

if (!profileRes.data) {
  console.error('❌ Utilizador não encontrado.');
  process.exit(1);
}

console.log('✅ Utilizador promovido a ADMIN.');
