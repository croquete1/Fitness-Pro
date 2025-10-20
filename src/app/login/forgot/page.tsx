'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { AuthNeoShell } from '@/components/auth/AuthNeoShell';
export default function ForgotPasswordPage() {
  return (
    <AuthNeoShell
      title="Recuperar palavra-passe"
      subtitle="Em breve poderás pedir a reposição diretamente a partir deste painel."
      tone="notice"
      footer={
        <p className="neo-auth__footnote">
          Prefere suporte imediato?{' '}
          <Link href="mailto:support@fitness.pro" className="neo-auth__link">
            Envia-nos um email
          </Link>
        </p>
      }
    >
      <div className="neo-auth__notice">
        <span className="neo-auth__noticeIcon" aria-hidden>
          <AlertTriangle />
        </span>
        <div>
          <p className="neo-auth__noticeTitle">Funcionalidade em atualização</p>
          <p className="neo-auth__noticeDescription">
            Até lá, contacta o teu PT ou administrador para apoio imediato e registo manual da alteração.
          </p>
        </div>
      </div>
    </AuthNeoShell>
  );
}
