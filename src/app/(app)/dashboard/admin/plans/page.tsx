import * as React from 'react';
import { Container } from '@mui/material';
import PlansClient from './PlansClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <Container maxWidth={false} sx={{ display: 'grid', gap: 2, px: { xs: 2, md: 3 }, width: '100%' }}>
      <PlansClient />
    </Container>
  );
}
