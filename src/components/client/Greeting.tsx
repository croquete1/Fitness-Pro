'use client';
import * as React from 'react';
import { Typography, Box } from '@mui/material';

export default function Greeting({ name }: { name?: string | null }) {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite';
  const emoji = h < 12 ? '🌅' : h < 20 ? '🌤️' : '🌙';
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="h5" fontWeight={800}>
        {emoji} {greet}{name ? `, ${name}` : ''}!
      </Typography>
    </Box>
  );
}
