import * as React from 'react';
import { Container } from '@mui/material';
import { withDashboardContentSx } from '@/styles/dashboardContentSx';
import PlansClient from './PlansClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <Container sx={withDashboardContentSx({ display: 'grid', gap: 2 })}>
      <PlansClient />
    </Container>
  );
}
