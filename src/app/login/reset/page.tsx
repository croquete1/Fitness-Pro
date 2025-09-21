// src/app/login/reset/page.tsx
import { Suspense } from 'react';
import ResetClient from './ResetClient';

export const dynamic = 'force-dynamic';

export default function ResetPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '40dvh' }} />}>
      <ResetClient />
    </Suspense>
  );
}
