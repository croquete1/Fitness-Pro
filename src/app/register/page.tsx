// src/app/register/page.tsx
import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Criar conta · ${brand.name}`,
  description: 'Regista um novo cliente e começa a gerir treinos no HMS.',
};

export default function Page() {
  return <RegisterClient />;
}
