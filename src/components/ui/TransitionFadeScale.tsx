'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  show: boolean;
  children: React.ReactNode;
  /** ms – opcional (default 160 in / 140 out) */
  durationIn?: number;
  durationOut?: number;
  /** chamado depois da animação de saída concluir */
  onExited?: () => void;
  className?: string;
};

export default function TransitionFadeScale({
  show,
  children,
  durationIn = 160,
  durationOut = 140,
  onExited,
  className,
}: Props) {
  const [render, setRender] = useState(show);
  const [leaving, setLeaving] = useState(false);
  const outRef = useRef<number>();

  useEffect(() => {
    if (show) {
      if (outRef.current) window.clearTimeout(outRef.current);
      setRender(true);
      setLeaving(false);
    } else if (render) {
      setLeaving(true);
      outRef.current = window.setTimeout(() => {
        setRender(false);
        setLeaving(false);
        onExited?.();
      }, durationOut);
    }
    return () => { if (outRef.current) window.clearTimeout(outRef.current); };
  }, [show, render, durationOut, onExited]);

  if (!render) return null;

  return (
    <div
      className={className}
      data-anim={leaving ? 'leave' : 'enter'}
      style={
        !leaving
          ? { ['--anim-in' as any]: `${durationIn}ms` }
          : { ['--anim-out' as any]: `${durationOut}ms` }
      }
    >
      {children}
    </div>
  );
}
