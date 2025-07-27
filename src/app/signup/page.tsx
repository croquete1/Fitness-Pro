"use client";

import React from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function SignupPage() {
  return (
    <main className="p-6">
      <h1>Registo</h1>
      <Input label="Nome"     type="text"     />
      <Input label="Email"    type="email"    />
      <Input label="Password" type="password" />
      <Button>Registar</Button>
    </main>
  );
}
