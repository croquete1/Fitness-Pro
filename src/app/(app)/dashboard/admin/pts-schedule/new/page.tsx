'use client';

import * as React from 'react';
import { Container, Box, Typography } from '@mui/material';
import SessionFormClient from '../SessionFormClient';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const sp = useSearchParams();

  // lê presets da toolbar (se existirem)
  const initial = React.useMemo(() => {
    const get = (k: string) => sp.get(k) ?? '';
    return {
      start_time: get('start_time'),
      end_time: get('end_time'),
      trainer_id: get('trainer_id') || undefined,
      client_id: get('client_id') || undefined,
    };
  }, [sp]);

  return (
    <Container maxWidth="md" sx={{ display: 'grid', gap: 2 }}>
      <Box>
        <Typography variant="h6" fontWeight={800}>
          ➕ Nova sessão
        </Typography>
      </Box>
      <SessionFormClient mode="create" initial={initial} />
    </Container>
  );
}
