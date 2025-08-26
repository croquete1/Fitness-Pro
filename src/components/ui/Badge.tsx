/* eslint-disable @next/next/no-img-element */
import React from 'react';

type Variant = 'neutral'|'primary'|'success'|'warning'|'danger'|'info';

export default function Badge({
  children, variant='neutral', className=''
}: React.PropsWithChildren<{variant?:Variant; className?:string;}>) {
  const map: Record<Variant,string> = {
    neutral:'', primary:' badge--primary', success:' badge--success',
    warning:' badge--warning', danger:' badge--danger', info:' badge--info'
  };
  return <span className={`badge${map[variant]} ${className}`.trim()}>{children}</span>;
}
