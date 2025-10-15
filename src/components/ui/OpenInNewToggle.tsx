'use client';

import * as React from 'react';
import { ExternalLink } from 'lucide-react';

export default function OpenInNewToggle({
  checked,
  onChange,
  label = 'Abrir em nova aba',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  const toggle = React.useCallback(() => {
    onChange(!checked);
  }, [checked, onChange]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="btn ghost inline-flex items-center gap-2"
      data-active={checked ? 'true' : 'false'}
      onClick={toggle}
    >
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      <span className="hidden text-sm font-medium sm:inline">{label}</span>
    </button>
  );
}
