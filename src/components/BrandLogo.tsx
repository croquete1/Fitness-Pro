import * as React from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';

export default function BrandLogo({ size = 56 }: { size?: number }) {
  return (
    <Box sx={{ width: size, height: size, display: 'inline-flex' }}>
      <Image
        src="/public/logo.png"
        alt="Fitness Pro"
        width={size}
        height={size}
        priority
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </Box>
  );
}
