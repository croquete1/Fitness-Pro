// src/components/GreetingBanner.tsx
'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function greetingByHour(d = new Date()) {
  const h = d.getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

export default function GreetingBanner({
  name,
  role,
}: {
  name: string;
  role?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        p: 2,
        mb: 2.5,
        borderRadius: 3,
        background:
          t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(51,65,85,0.6), rgba(2,6,23,0.6))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.08))',
        border: `1px solid ${t.palette.divider}`,
      })}
    >
      <Box>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
          {greetingByHour()}, {name}
        </Typography>
        {role && (
          <Typography variant="caption" sx={{ letterSpacing: 1, opacity: 0.8 }}>
            {role.toUpperCase()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
