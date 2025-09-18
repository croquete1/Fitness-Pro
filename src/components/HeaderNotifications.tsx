// src/components/HeaderNotifications.tsx
'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

export type NotificationItem = { id: string; title: string; sub?: string; unread?: boolean };

export default function HeaderNotifications({
  items = [],
  unread = 0,
}: {
  items?: NotificationItem[];
  unread?: number;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton aria-label="Notificações" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge color="error" badgeContent={unread}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 320 } } }}
      >
        {items.length === 0 ? (
          <MenuItem disabled>
            <ListItemText
              primary={<Typography variant="body2">Sem novas notificações</Typography>}
            />
          </MenuItem>
        ) : (
          items.map((n) => (
            <MenuItem key={n.id} onClick={() => setAnchorEl(null)} selected={!!n.unread}>
              <ListItemText
                primary={n.title}
                secondary={n.sub}
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ noWrap: true }}
              />
              {n.unread && (
                <ListItemSecondaryAction>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
                </ListItemSecondaryAction>
              )}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
