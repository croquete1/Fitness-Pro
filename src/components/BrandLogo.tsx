'use client';

import * as React from 'react';
import { Box } from '@mui/material';

type Props = {
  size?: number;          // altura/largura em px
  color?: string;         // opcional, por omissão usa 'primary.main'
  label?: string;         // aria-label
};

export default function BrandLogo({ size = 56, color, label = 'Fitness Pro' }: Props) {
  return (
    <Box
      role="img"
      aria-label={label}
      sx={{ width: size, height: size, color: color ?? 'primary.main' }}
    >
      {/* SVG inline: herda a cor via currentColor (funciona em dark/light) */}
      <svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* Disco esquerdo */}
        <rect x="2" y="20" width="10" height="24" rx="2" fill="currentColor" />
        {/* Disco direito */}
        <rect x="52" y="20" width="10" height="24" rx="2" fill="currentColor" />
        {/* Barra */}
        <rect x="10" y="30" width="44" height="4" rx="2" fill="currentColor" />
        {/* Pegas */}
        <rect x="14" y="26" width="6" height="12" rx="1.5" fill="currentColor" opacity="0.7" />
        <rect x="44" y="26" width="6" height="12" rx="1.5" fill="currentColor" opacity="0.7" />
      </svg>
    </Box>
  );
}
