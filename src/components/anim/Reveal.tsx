'use client';

import * as React from 'react';

type RevealProps = {
  as?: keyof JSX.IntrinsicElements;
  delay?: number;                 // ms
  className?: string;
  children: React.ReactNode;
  variant?: 'fade' | 'up';        // fade-in simples ou fade-in + translateY
};

export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  variant = 'up',
}: RevealProps) {
  const animClass = variant === 'fade' ? 'animate-fade-in' : 'animate-fade-in-up';
  return (
    <Tag
      className={`opacity-0 ${animClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
