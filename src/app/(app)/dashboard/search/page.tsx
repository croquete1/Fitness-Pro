// src/app/(app)/dashboard/search/page.tsx
import * as React from 'react';
import { Container, Typography } from '@mui/material';
// Mantém o nome do teu ficheiro cliente (respeita a capitalização que já tens no projeto)
import SearchClient from './SearchClient';

export const dynamic = 'force-dynamic';

type Params = { q?: string; role?: string };

// ⚠️ Esta página é Server Component — não passa funções ao cliente.
// Apenas lê os searchParams e entrega ao componente cliente.
export default function SearchPage({ searchParams }: { searchParams?: Params }) {
  const q = (searchParams?.q ?? '').toString();
  const role = (searchParams?.role ?? 'ADMIN').toUpperCase();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        🔎 Pesquisa
      </Typography>
      {/* ✅ Componente client que faz debounce + “ver mais” por grupo chamando /api/search */}
      <SearchClient initialQuery={q} role={role} />
    </Container>
  );
}
