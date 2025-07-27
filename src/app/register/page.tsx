// src/app/register/page.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center">Criar Conta</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar Password"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Registar
        </button>

        <p className="text-sm text-center text-gray-600">
          Já tens conta?{' '}
          <Link href="/login" className="text-green-600 underline">
            Inicia sessão
          </Link>
        </p>
      </form>
    </main>
  );
}
