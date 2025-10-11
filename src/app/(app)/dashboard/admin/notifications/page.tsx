import * as React from 'react';
import { Container } from '@mui/material';
import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Container maxWidth={false} sx={{ display: 'grid', gap: 2, px: { xs: 2, md: 3 }, width: '100%' }}>
      <NotificationsClient pageSize={20} />
    </Container>
  );
}
