'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Chip from '@mui/material/Chip';

function labelColor(role: 'CLIENT' | 'PT' | 'ADMIN') {
  switch (role) {
    case 'PT': return 'secondary';
    case 'ADMIN': return 'default';
    default: return 'primary';
  }
}

export default function RoleMenu({
  userId, role, disabled, onChanged,
}: {
  userId: string;
  role: 'CLIENT' | 'PT' | 'ADMIN';
  disabled?: boolean;
  onChanged?: (newRole: 'CLIENT' | 'PT') => void;
}) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const [busy, setBusy] = React.useState(false);

  const open = Boolean(anchor);
  const isAdmin = role === 'ADMIN';

  async function choose(next: 'CLIENT' | 'PT') {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: next }),
      });
      if (res.ok) onChanged?.(next);
    } finally {
      setBusy(false);
      setAnchor(null);
    }
  }

  if (isAdmin) {
    return <Chip label="ADMIN" color={labelColor('ADMIN')} size="small" />;
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<KeyboardArrowDownIcon />}
        disabled={disabled || busy}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        ROLE: {role}
      </Button>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => choose('CLIENT')}>CLIENT</MenuItem>
        <MenuItem onClick={() => choose('PT')}>PT</MenuItem>
      </Menu>
    </>
  );
}
