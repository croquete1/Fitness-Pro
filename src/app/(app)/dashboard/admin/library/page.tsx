import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExerciseLibraryClient from '@/components/exercise/library/ExerciseLibraryClient';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { withDashboardContentSx } from '@/styles/dashboardContentSx';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Biblioteca de exercícios · Administração' };

export default async function AdminExerciseLibraryPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  return (
    <Box component="section" sx={withDashboardContentSx()}>
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
          Biblioteca de exercícios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Centraliza o catálogo global e revê os exercícios criados pelos PTs num só lugar.
        </Typography>
        <ExerciseLibraryClient initialScope="global" />
      </Stack>
    </Box>
  );
}
