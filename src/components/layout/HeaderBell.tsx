'use client';
import * as React from 'react';
import { Badge, IconButton, Menu, MenuItem, ListItemText } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function HeaderBell() {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const [items, setItems] = React.useState<{ id: string; title: string; href?: string }[]>([]);
  const open = Boolean(anchor);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/notifications/dropdown', { cache: 'no-store' });
        const j = await r.json();
        setItems(Array.isArray(j.items) ? j.items : []);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  return (
    <>
      <IconButton aria-label="Notificações" onClick={(e) => setAnchor(e.currentTarget)}>
        <Badge color="error" badgeContent={items.length}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
        {items.length === 0 ? (
          <MenuItem disabled>Sem notificações</MenuItem>
        ) : (
          items.map(n => (
            <MenuItem key={n.id} component="a" href={n.href ?? '#'} onClick={() => setAnchor(null)}>
              <ListItemText primary={n.title} />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
