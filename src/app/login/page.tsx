"use client";

import React from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function LoginPage() {
  return (
    <main className="p-6">
      <h1>Login</h1>
      <Input label="Email" type="email" />
      <Input label="Password" type="password" />
      <Button>Entrar</Button>
    </main>
  );
}
