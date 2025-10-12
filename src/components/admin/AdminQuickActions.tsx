import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

export default function AdminQuickActions() {
  const actions = [
    { href: '/dashboard/admin/approvals',     label: 'Aprovações',   icon: <CheckCircleOutlineIcon /> },
    { href: '/dashboard/admin/users',         label: 'Utilizadores', icon: <GroupOutlinedIcon /> },
    { href: '/dashboard/admin/library',       label: 'Biblioteca',   icon: <FitnessCenterOutlinedIcon /> },
    { href: '/dashboard/admin/plans',         label: 'Planos',       icon: <LibraryBooksOutlinedIcon /> },
    { href: '/dashboard/admin/pts-schedule',  label: 'Agenda PTs',   icon: <EventAvailableOutlinedIcon /> },
    { href: '/dashboard/admin/notifications', label: 'Notificações', icon: <NotificationsNoneOutlinedIcon /> },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ px: .5, mb: 1 }}>
        Ações rápidas
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Stack direction="row" spacing={1} sx={{ minWidth: 560, pb: .5, '& a': { textDecoration: 'none' } }}>
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
