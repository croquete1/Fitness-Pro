'use client';
import { Toasts } from '@/components/ui';
import React from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
          {children} 
           <Toasts />

    </>
  );
}
