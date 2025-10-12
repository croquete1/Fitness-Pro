import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { withDashboardContentSx } from '@/styles/dashboardContentSx';
import ExercisesClient from './exercises.client';

export const dynamic = 'force-dynamic';

export default function AdminExercisesPage() {
  return (
    <Box component="section" sx={withDashboardContentSx()}>
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
          Exercícios
        </Typography>
        <ExercisesClient />
      </Stack>
    </Box>
  );
}
