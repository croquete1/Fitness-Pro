// src/app/(app)/dashboard/clients/wallet/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { Box, Paper, Typography } from '@mui/material';

export default async function WalletPage(){
  const s = await getSessionUserSafe(); if(!s?.user?.id) redirect('/login');
  const sb = createServerClient();
  const [{ data: bal }, { data: tx }] = await Promise.all([
    sb.from('client_wallet').select('balance').eq('user_id', s.user.id).maybeSingle(),
    sb.from('client_wallet_entries').select('id,created_at,amount,desc').eq('user_id', s.user.id).order('created_at', { ascending:false }).limit(100),
  ]);

  return (
    <Box sx={{ display:'grid', gap:2 }}>
      <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}>
        <Typography variant="h6" fontWeight={800}>Carteira</Typography>
        <Typography sx={{ mt: .5 }}>Saldo: <b>{(bal?.balance ?? 0).toFixed(2)} €</b></Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}>
        <Typography variant="subtitle1" fontWeight={700}>Movimentos</Typography>
        <ul style={{ margin:0, paddingLeft:16 }}>
          {(tx ?? []).map((t:any)=>(
            <li key={t.id}>
              {new Date(t.created_at).toLocaleString('pt-PT')} — {t.desc ?? '—'} — <b>{(t.amount ?? 0).toFixed(2)} €</b>
            </li>
          ))}
          {(!tx || tx.length===0) && <Typography sx={{ opacity:.7 }}>Sem movimentos.</Typography>}
        </ul>
      </Paper>
    </Box>
  );
}
