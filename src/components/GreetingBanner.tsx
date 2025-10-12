// src/components/GreetingBanner.tsx
'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { greetingForDate } from '@/lib/time';

export default function GreetingBanner({
  name,
  roleTag, // opcional — não mostrar no cliente
}: {
  name: string;
  roleTag?: string;
}) {
  const { label, emoji } = greetingForDate();
  const title = `${label}, ${name}`;
  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        p: 2,
        mb: 2.5,
        borderRadius: 3,
        background:
          t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(17,24,39,0.85), rgba(2,6,23,0.85))' // 👁️ mais contraste
            : 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(59,130,246,0.10))',
        border: `1px solid ${t.palette.divider}`,
      })}
    >
      <Box>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
          {emoji} {title}!
        </Typography>
        {!!roleTag && (
          <Typography variant="caption" sx={{ letterSpacing: 1, opacity: 0.8 }}>
            {roleTag.toUpperCase()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
