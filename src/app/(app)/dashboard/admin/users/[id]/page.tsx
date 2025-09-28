import { createServerClient } from '@/lib/supabaseServer';
import { Container, Typography, Stack, Chip } from '@mui/material';

export default async function AdminUserProfilePage({ params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data: user } = await sb.from('users')
    .select('id, name, email, role, approved, active, created_at')
    .eq('id', params.id)
    .single();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Perfil do utilizador
      </Typography>

      {user ? (
        <Stack spacing={1}>
          <Typography variant="h6" fontWeight={700}>{user.name ?? '—'}</Typography>
          <Typography color="text.secondary">{user.email}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={String(user.role).toUpperCase()} />
            <Chip label={user.approved ? 'Aprovado ✅' : 'Por aprovar'} />
            <Chip label={user.active ? 'Ativo' : 'Inativo'} />
          </Stack>
        </Stack>
      ) : (
        <Typography color="text.secondary">Utilizador não encontrado.</Typography>
      )}
    </Container>
  );
}
