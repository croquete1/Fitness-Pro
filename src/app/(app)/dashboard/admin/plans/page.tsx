import * as React from 'react';
import { Container } from '@mui/material';
import PlansClient from './PlansClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <Container maxWidth="lg" sx={{ display: 'grid', gap: 2 }}>
      <PlansClient />
    </Container>
  );
}
