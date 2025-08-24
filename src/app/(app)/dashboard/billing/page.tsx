import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  // Coloca aqui a tua integração (ex.: Stripe) – por agora placeholder:
  return (
    <div className="card" style={{ padding:16 }}>
      <h1>Pagamentos</h1>
      <p>Em breve: resumo de subscrições, invoices e métodos de pagamento.</p>
    </div>
  );
}
