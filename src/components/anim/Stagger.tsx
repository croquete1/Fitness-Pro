'use client';

import * as React from 'react';

type StaggerProps = {
  children: React.ReactNode;
  step?: number; // milissegundos entre itens
};

export function Stagger({ children, step = 80 }: StaggerProps) {
  const items = React.Children.toArray(children);

  return (
    <>
      {items.map((child, i) => {
        if (!React.isValidElement(child)) return child;
        const prevStyle = (child.props as any)?.style ?? {};
        return React.cloneElement(child as any, {
          style: { ...prevStyle, animationDelay: `${i * step}ms` },
        });
      })}
    </>
  );
}
