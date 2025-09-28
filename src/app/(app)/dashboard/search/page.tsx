import { Container, Box, Typography } from '@mui/material';
import SearchClient from './search.client';

export const dynamic = 'force-dynamic';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q ?? '').trim();
  // role “ADMIN” por omissão; se quiseres, passa via sessão
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>🔎 Pesquisa</Typography>
      <Box>
        <SearchClient initialQuery={q} role="ADMIN" />
      </Box>
    </Container>
  );
}
