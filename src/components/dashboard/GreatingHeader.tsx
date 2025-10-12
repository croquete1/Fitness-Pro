'use client';

import * as React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import { greetingForDate } from '@/lib/time';

export default function GreetingHeader({ name }: { name?: string | null }) {
  const { label, emoji } = greetingForDate();
  const message = name ? `${label}, ${name}` : label;
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={800}>
          {emoji} {message}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aqui tens um resumo rápido do teu dia.
        </Typography>
      </Stack>
    </Paper>
  );
}
