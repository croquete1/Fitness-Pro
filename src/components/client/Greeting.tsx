'use client';
import * as React from 'react';
import { Typography, Box } from '@mui/material';
import { greetingForDate } from '@/lib/time';

export default function Greeting({ name }: { name?: string | null }) {
  const { label, emoji } = greetingForDate();
  const message = name ? `${label}, ${name}` : label;
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="h5" fontWeight={800}>
        {emoji} {message}!
      </Typography>
    </Box>
  );
}
