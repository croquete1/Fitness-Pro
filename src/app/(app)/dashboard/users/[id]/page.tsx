export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { default as Link } from 'next/link';

export default async function UserProfileView({ params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  const me = session?.user; if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  const targetId = params.id;

  const sb = createServerClient();

  // permissão: ADMIN sempre; PT se cliente seu; CLIENT só se for o próprio
  if (role !== 'ADMIN' && me.id !== targetId) {
    if (role === 'PT') {
      const { data: s } = await sb.from('sessions').select('id').eq('trainer_id', me.id).eq('client_id', targetId).limit(1);
      const { data: p } = await sb.from('training_plans').select('id').eq('trainer_id', me.id).eq('client_id', targetId).limit(1);
      if (!s?.length && !p?.length) notFound();
    } else {
      notFound();
    }
  }

  const { data: u } = await sb.from('profiles').select('id,name,email,username,avatar_url,role').eq('id', targetId).maybeSingle();
  if (!u) notFound();

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader title={u.name ?? u.email ?? 'Utilizador'} subheader={u.role ?? ''} />
        <CardContent>
          <Typography sx={{ mb: 1.5 }}>Email: {u.email ?? '—'}</Typography>
          <div className="text-sm">
            <Link className="underline" href={`/dashboard/my-plan`}>Ver planos</Link>
            {' · '}
            <Link className="underline" href={`/dashboard/sessions`}>Ver sessões</Link>
          </div>
        </CardContent>
      </Card>

      {/* Antropometria (read-only) */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader title="Antropometria" subheader="Histórico do cliente" />
        <CardContent>
          {/* Reutiliza API com userId */}
          {/* Podes trocar por um componente se quiseres mais tarde */}
          <iframe
            src={`/api/profile/metrics?userId=${encodeURIComponent(targetId)}&embed=table`}
            style={{ display: 'none' }}
            title="hidden"
          />
          <p className="opacity-70 text-sm">
            Abre o perfil do próprio cliente para ver a versão editável. Este painel é apenas resumo rápido.
          </p>
        </CardContent>
      </Card>
    </Box>
  );
}
