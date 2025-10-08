'use client';

import * as React from 'react';
import { FormControlLabel, Switch, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function OpenInNewToggle({
  checked,
  onChange,
  label = 'Abrir em nova aba',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <Tooltip title={label}>
      <FormControlLabel
        control={<Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />}
        label={<OpenInNewIcon fontSize="small" />}
        labelPlacement="start"
        sx={{ ml: 0 }}
      />
    </Tooltip>
  );
}
