'use client';

import * as React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import AdminExerciseFormClient from '../AdminExerciseFormClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Container maxWidth="sm" sx={{ display:'grid', gap:2, py: 2 }}>
      <Typography variant="h5" fontWeight={800}>➕ Novo exercício</Typography>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <AdminExerciseFormClient mode="create" />
      </Paper>
    </Container>
  );
}
