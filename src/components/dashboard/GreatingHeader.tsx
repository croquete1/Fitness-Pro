'use client';

import * as React from 'react';
import { Paper, Stack, Typography } from '@mui/material';

function getGreeting(now = new Date()) {
  const h = now.getHours();
  if (h >= 5 && h < 12) return { txt: 'Bom dia', emoji: '🌅' };
  if (h >= 12 && h < 19) return { txt: 'Boa tarde', emoji: '🌤️' };
  if (h >= 19 && h < 24) return { txt: 'Boa noite', emoji: '🌙' };
  return { txt: 'Boa madrugada', emoji: '🦉' };
}

export default function GreetingHeader({ name }: { name?: string | null }) {
  const { txt, emoji } = getGreeting();
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={800}>
          {emoji} {txt}{name ? `, ${name}` : ''}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aqui tens um resumo rápido do teu dia.
        </Typography>
      </Stack>
    </Paper>
  );
}
