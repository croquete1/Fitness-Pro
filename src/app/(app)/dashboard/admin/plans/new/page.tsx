import * as React from 'react';
import { Container, Box, Typography } from '@mui/material';
import PlanFormClient from '../PlanFormClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h5" fontWeight={800}>➕ Novo plano</Typography>
      <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <PlanFormClient mode="create" />
      </Box>
    </Container>
  );
}
