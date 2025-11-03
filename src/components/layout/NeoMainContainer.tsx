'use client';

import * as React from 'react';
import clsx from 'clsx';

export type NeoMainContainerProps = React.HTMLAttributes<HTMLElement> & {
  maxWidth?: 'xl' | 'lg' | 'md' | 'sm' | false;
  disableGutters?: boolean;
  spacing?: number;
};

const WIDTH_MAP: Record<'xl' | 'lg' | 'md' | 'sm', string> = {
  xl: '1280px',
  lg: '1120px',
  md: '864px',
  sm: '640px',
};

export const NeoMainContainer = React.forwardRef<HTMLElement, NeoMainContainerProps>(
  function NeoMainContainer(
    { children, className, maxWidth = 'xl', disableGutters = false, spacing = 2, ...rest },
    ref,
  ) {
    const gapValue = React.useMemo(() => {
      const value = typeof spacing === 'number' ? Math.max(0, spacing) * 8 : 16;
      return `${value}px`;
    }, [spacing]);

    const innerStyle = React.useMemo(
      () =>
        ({
          '--neo-main-max-width': maxWidth && WIDTH_MAP[maxWidth] ? WIDTH_MAP[maxWidth] : '100%',
        } as React.CSSProperties),
      [maxWidth],
    );

    const stackStyle = React.useMemo(
      () => ({ '--neo-stack-gap': gapValue } as React.CSSProperties),
      [gapValue],
    );

    return (
      <main ref={ref} className={clsx('neo-main', className)} {...rest}>
        <div
          className={clsx('neo-main__inner', disableGutters && 'neo-main__inner--flush')}
          style={innerStyle}
        >
          <div className="neo-stack" style={stackStyle}>
            {children}
          </div>
        </div>
      </main>
    );
  },
);

export default NeoMainContainer;
