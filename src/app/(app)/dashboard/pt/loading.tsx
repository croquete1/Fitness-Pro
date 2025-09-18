// src/app/(app)/dashboard/pt/loading.tsx
'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';

export default function Loading() {
  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="text" width="40%" height={28} />
      </Paper>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rectangular" height={48} sx={{ mt: 1 }} />
          </Paper>
        ))}
      </Box>
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rectangular" height={120} sx={{ mt: 1 }} />
      </Paper>
    </Box>
  );
}
