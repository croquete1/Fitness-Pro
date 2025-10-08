'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, IconButton, Typography, Box, Badge, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { useHeaderCounts } from '@/components/header/HeaderCountsContext';

type Props = { userLabel?: string };

export default function AppHeader({ userLabel }: Props) {
  const { openMobile } = useSidebar();
  const { role, approvalsCount, messagesCount, notificationsCount } = useHeaderCounts();

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>
        <IconButton aria-label="menu" onClick={() => openMobile(true)} size="small">
          <MenuIcon />
        </IconButton>

        <Typography
          component={Link}
          href="/dashboard"
          prefetch={false}
          variant="h6"
          sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 800, letterSpacing: 0.2 }}
        >
          Fitness Pro
        </Typography>

        <Box sx={{ flex: 1 }} />

        {role === 'ADMIN' && (
          <Tooltip title="Aprovações">
            <IconButton component={Link} href="/dashboard/admin/approvals" prefetch={false} size="small" sx={{ mr: 0.5 }}>
              <Badge color="error" badgeContent={approvalsCount ?? 0} max={99}>
                <CheckCircleOutline />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        {role === 'CLIENT' && (
          <Tooltip title="Mensagens">
            <IconButton component={Link} href="/dashboard/messages" prefetch={false} size="small" sx={{ mr: 0.5 }}>
              <Badge color="error" badgeContent={messagesCount ?? 0} max={99}>
                <ChatBubbleOutline />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Notificações">
          <IconButton component={Link} href="/dashboard/notifications" prefetch={false} size="small" sx={{ mr: 1 }}>
            <Badge color="error" badgeContent={notificationsCount ?? 0} max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {userLabel && (
          <Typography variant="body2" sx={{ mr: 1.5, color: 'text.secondary' }}>
            {userLabel}
          </Typography>
        )}

        <ThemeToggleButton />
      </Toolbar>
    </AppBar>
  );
}
