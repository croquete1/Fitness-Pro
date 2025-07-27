// src/app/page.tsx
'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Bem-vindo ao Fitness Pro</h1>
      <p className="text-gray-600 mb-8">Começa já a acompanhar os teus treinos personalizados!</p>
      <div className="space-x-4">
        <Link href="/login">
          <button className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
            Iniciar Sessão
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition">
            Criar Conta
          </button>
        </Link>
      </div>
    </main>
  );
}
