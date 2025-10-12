import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExercisesClient from './exercises.client';

export const dynamic = 'force-dynamic';

export default function AdminExercisesPage() {
  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        maxWidth: (theme) => theme.breakpoints.values.xl,
        mx: 'auto',
        boxSizing: 'border-box',
        px: { xs: 2, md: 3, lg: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
          Exercícios
        </Typography>
        <ExercisesClient />
      </Stack>
    </Box>
  );
}
