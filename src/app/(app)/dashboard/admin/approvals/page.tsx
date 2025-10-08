import * as React from 'react';
import { Container } from '@mui/material';
import ApprovalsClient from './ApprovalsClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Container maxWidth="lg" sx={{ display: 'grid', gap: 2 }}>
      <ApprovalsClient pageSize={20} />
    </Container>
  );
}
