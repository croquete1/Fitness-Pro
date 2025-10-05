import * as React from 'react';
import { Container } from '@mui/material';
import UserFormClient from '../UserFormClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  const initial = {
    name: '',
    email: '',
    role: 'client' as const,
    status: 'active' as const,
    approved: true,
    active: true,
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      <UserFormClient mode="create" initial={initial} />
    </Container>
  );
}
