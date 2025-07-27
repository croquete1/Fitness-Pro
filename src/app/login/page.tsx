// src/app/login/page.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center">Iniciar Sessão</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>

        <p className="text-sm text-center text-gray-600">
          Ainda não tens conta?{' '}
          <Link href="/register" className="text-blue-600 underline">
            Regista-te
          </Link>
        </p>
      </form>
    </main>
  );
}
