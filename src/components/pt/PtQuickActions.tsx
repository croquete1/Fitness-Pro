'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

export default function PtQuickActions() {
  const actions = [
    { href: '/dashboard/pt/sessions', label: 'Sessões',    icon: <EventAvailableOutlinedIcon /> },
    { href: '/dashboard/pt/my-plan',  label: 'Planos',     icon: <AssignmentOutlinedIcon /> },
    { href: '/dashboard/pt/library',  label: 'Biblioteca', icon: <LibraryBooksOutlinedIcon /> },
    { href: '/dashboard/messages',    label: 'Mensagens',  icon: <MessageOutlinedIcon /> },
    { href: '/dashboard/clients',     label: 'Clientes',   icon: <GroupOutlinedIcon /> },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ px: .5, mb: 1 }}>
        Ações rápidas
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Stack direction="row" spacing={1} sx={{ minWidth: 480, pb: .5, '& a': { textDecoration: 'none' } }}>
          {actions.map((a) => (
            <Button key={a.href} component={Link} href={a.href} startIcon={a.icon} size="small" variant="outlined" sx={{ borderRadius: 2 }}>
              {a.label}
            </Button>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}
