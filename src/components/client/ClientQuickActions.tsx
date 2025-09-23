'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export default function ClientQuickActions() {
  const actions = [
    { href: '/dashboard/my-plan',      label: 'Os meus planos', icon: <AssignmentOutlinedIcon /> },
    { href: '/dashboard/sessions',     label: 'Sessões',        icon: <EventAvailableOutlinedIcon /> },
    { href: '/dashboard/messages',     label: 'Mensagens',      icon: <MessageOutlinedIcon /> },
    { href: '/dashboard/notifications',label: 'Notificações',   icon: <NotificationsNoneOutlinedIcon /> },
    { href: '/dashboard/profile',      label: 'Perfil',         icon: <PersonOutlineOutlinedIcon /> },
  ];
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ px: .5, mb: 1 }}>
        Ações rápidas
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Stack direction="row" spacing={1} sx={{ minWidth: 520, pb: .5, '& a': { textDecoration: 'none' } }}>
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
