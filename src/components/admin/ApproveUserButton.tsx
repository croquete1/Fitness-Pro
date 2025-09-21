'use client';

import * as React from 'react';
import { Button, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { toast } from 'sonner';

type Props = {
  userId?: string;
  email?: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  onDone?: (payload: any) => void;
};

export default function ApproveUserButton({
  userId, email, variant = 'contained', size = 'small', onDone,
}: Props) {
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    if (!userId && !email) {
      toast.error('Falta id ou email do utilizador.');
      return;
    }
    setBusy(true);
    const body: any = { sendInvite: true, sendReset: false };
    if (userId) body.id = userId;
    if (email) body.email = email;

    try {
      const res = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        toast.error(`Falha ao aprovar: ${json?.error || res.statusText}`);
      } else {
        toast.success('Utilizador aprovado com sucesso.');
        onDone?.(json);
      }
    } catch (e: any) {
      toast.error('Erro de rede ao aprovar utilizador.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Tooltip title="Aprovar utilizador">
      <span>
        <Button
          startIcon={<CheckIcon />}
          variant={variant}
          size={size}
          disabled={busy}
          onClick={onClick}
        >
          {busy ? 'A aprovar…' : 'Aprovar'}
        </Button>
      </span>
    </Tooltip>
  );
}
