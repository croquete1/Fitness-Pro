'use client';

import * as React from 'react';
import { Container, Box, Typography } from '@mui/material';
import TrainerScheduleClient from './TrainerScheduleClient';
import { withDashboardContentSx } from '@/styles/dashboardContentSx';

export default function Page() {
  return (
    <Container sx={withDashboardContentSx({ display: 'grid', gap: 2 })}>
      <Box><Typography variant="h6" fontWeight={800}>Agenda (PT)</Typography></Box>
      <TrainerScheduleClient pageSize={20} />
    </Container>
  );
}
