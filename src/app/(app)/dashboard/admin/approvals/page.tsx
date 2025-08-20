import ApprovalsClient from './ApprovalsClient';

export default async function ApprovalsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Aprovações de conta</h1>
        <p className="text-muted small">Gerir pedidos de registo pendentes.</p>
      </div>
      <ApprovalsClient />
    </div>
  );
}
