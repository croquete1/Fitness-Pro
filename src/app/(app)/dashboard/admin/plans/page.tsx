// src/app/(app)/dashboard/admin/plans/page.tsx
import { redirect } from 'next/navigation';

// Por agora, aproveitamos o ecrã dos PTs.
// Quando tiveres um ecrã de listagem de planos para Admin, troca por conteúdo próprio.
export default function AdminPlansRedirect() {
  redirect('/dashboard/pt/plans');
}
