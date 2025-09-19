export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q || '').trim();
  if (!q) redirect('/dashboard');

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800}>Resultados para “{q}”</Typography>
      <Typography variant="body2" sx={{ opacity: .7, mt: .5 }}>
        Usa a pesquisa do topo para abrir itens; esta página vai receber filtros e resultados completos numa próxima iteração.
      </Typography>
    </Paper>
  );
}
