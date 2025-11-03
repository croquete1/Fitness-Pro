'use client';

import * as React from 'react';
import clsx from 'clsx';

export type NeoFlexShellProps = React.HTMLAttributes<HTMLDivElement>;

export const NeoFlexShell = React.forwardRef<HTMLDivElement, NeoFlexShellProps>(
  function NeoFlexShell({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={clsx('neo-flex-shell', className)} {...rest}>
        {children}
      </div>
    );
  },
);

export default NeoFlexShell;
