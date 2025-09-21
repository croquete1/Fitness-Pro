#!/usr/bin/env node
// ESM, Node >= 20
import { createClient } from '@supabase/supabase-js';

// ---------------------- flags CLI ----------------------
const argv = new Set(process.argv.slice(2));
const DRY_RUN    = argv.has('--dry-run');
const NO_INVITE  = argv.has('--no-invite');
const SEND_RESET = argv.has('--send-reset');

// ---------------------- envs ---------------------------
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('❌ Missing envs: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
const REDIRECT_TO = APP_URL ? `${APP_URL}/login/reset` : undefined;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

// ---------------------- helpers ------------------------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(...a);
const err = (...a) => console.error(...a);

async function fetchUsersBatch(from, to) {
  // lê um lote de utilizadores; ajusta os campos conforme o teu schema
  const { data, error } = await sb
    .from('users')
    .select('id, email, auth_user_id, approved, is_active, status')
    .order('id', { ascending: true })
    .range(from, to);

  if (error) throw new Error(`DB read failed: ${error.message}`);
  return data || [];
}

async function countUsers() {
  const { count, error } = await sb.from('users').select('*', { count: 'exact', head: true });
  if (error) throw new Error(`DB count failed: ${error.message}`);
  return count || 0;
}

async function getAuthUserIdByEmail(email) {
  // truque: generateLink('recovery') devolve user se existir
  const { data, error } = await sb.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: REDIRECT_TO ? { redirectTo: REDIRECT_TO } : undefined,
  });
  if (!error && data?.user) return data.user.id;
  return null;
}

async function inviteAuthUser(email) {
  const { data, error } = await sb.auth.admin.inviteUserByEmail(
    email,
    REDIRECT_TO ? { redirectTo: REDIRECT_TO } : undefined
  );
  if (error) throw new Error(error.message);
  return data?.user?.id || null;
}

async function createAuthUser(email) {
  const { data, error } = await sb.auth.admin.createUser({
    email,
    email_confirm: false,
  });
  if (error) throw new Error(error.message);
  return data?.user?.id || null;
}

async function sendReset(email) {
  const { error } = await sb.auth.resetPasswordForEmail(
    email,
    REDIRECT_TO ? { redirectTo: REDIRECT_TO } : undefined
  );
  if (error) throw new Error(error.message);
}

async function updateLocalAuthId(localId, authId) {
  const { error } = await sb.from('users').update({ auth_user_id: authId }).eq('id', localId);
  if (error) throw new Error(error.message);
}

// ---------------------- main ---------------------------
(async () => {
  log('🔧 migrate-auth-users');
  log(`  dryRun=${DRY_RUN}  invite=${!NO_INVITE}  sendReset=${SEND_RESET}`);
  if (REDIRECT_TO) log('  redirectTo:', REDIRECT_TO);

  const total = await countUsers();
  log(`📦 users na tabela: ${total}`);
  const pageSize = 500;
  let from = 0;
  let created = 0, invited = 0, mapped = 0, resets = 0, skipped = 0, failures = 0;

  while (from < total) {
    const to = Math.min(from + pageSize - 1, total - 1);
    const rows = await fetchUsersBatch(from, to);

    for (const row of rows) {
      const email = String(row.email || '').trim().toLowerCase();
      if (!email) { skipped++; continue; }

      try {
        // se já está mapeado, opcionalmente envia reset e segue
        if (row.auth_user_id) {
          if (!DRY_RUN && SEND_RESET) {
            await sendReset(email); resets++;
            log('↻ reset enviado (já mapeado):', email);
          } else {
            skipped++;
          }
          continue;
        }

        // existe no Auth?
        let authId = await getAuthUserIdByEmail(email);

        // se não, convidar ou criar
        if (!authId) {
          if (NO_INVITE) {
            authId = await createAuthUser(email); created++;
            log('➕ criado no Auth:', email);
          } else {
            authId = await inviteAuthUser(email); invited++;
            log('✉️  convite enviado:', email);
          }
        }

        // mapear no local
        if (!DRY_RUN && authId) {
          await updateLocalAuthId(row.id, authId);
          mapped++;
        }

        // reset opcional
        if (!DRY_RUN && SEND_RESET) {
          await sendReset(email); resets++;
          log('↻ reset enviado:', email);
        }

        // pequena pausa para evitar rate-limit
        await sleep(100);
      } catch (e) {
        failures++;
        err('❌ falha para', email, '-', e.message || e);
        await sleep(150);
      }
    }

    from += pageSize;
  }

  log('✅ done');
  log({ created, invited, mapped, resets, skipped, failures });
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  err('Fatal:', e?.message || e);
  process.exit(1);
});
