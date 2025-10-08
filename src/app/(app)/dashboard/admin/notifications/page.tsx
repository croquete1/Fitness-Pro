import * as React from 'react';
import { Container } from '@mui/material';
import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Container maxWidth="lg" sx={{ display: 'grid', gap: 2 }}>
      <NotificationsClient pageSize={20} />
    </Container>
  );
}
