'use client';

import * as React from 'react';
import { Box } from '@mui/material';

import AppHeader from './AppHeader';
import RoleSidebar from './RoleSidebar';
import MainContent from './MainContent';

type Props = {
  role?: string;
  userLabel?: string | null | undefined;
  children: React.ReactNode;
};

export default function DashboardFrame({ role = 'CLIENT', userLabel, children }: Props) {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppHeader role={role} userLabel={userLabel ?? undefined} />
      <RoleSidebar role={role} userLabel={userLabel ?? undefined} />
      <MainContent>{children}</MainContent>
    </Box>
  );
}
