import React from 'react';
import AuthStatus from '@/components/AuthStatus';

export default function HomePage() {
  return (
    <main className="p-6">
      <h1>Bem-vindo</h1>
      <AuthStatus />
    </main>
  );
}
