import type { Metadata } from 'next';
import LoginClient from './LoginClient';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Entrar · ${brand.name}`,
  description: 'Autentica-te para aceder ao painel de gestão do HMS.',
};

export default function LoginPage() {
  return <LoginClient />;
}
