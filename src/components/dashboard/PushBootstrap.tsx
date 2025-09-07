// src/components/dashboard/PushBootstrap.tsx
'use client';
import { useEffect } from 'react';
import { registerPush } from '@/lib/push-client';

export default function PushBootstrap() {
  useEffect(() => { registerPush(); }, []);
  return null;
}
