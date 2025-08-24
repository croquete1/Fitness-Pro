import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id:true, name:true, email:true, role:true, status:true, createdAt:true },
  });

  return (
    <div className="card" style={{ padding:16 }}>
      <h1>Utilizadores</h1>
      <table className="table" style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
        <thead>
          <tr>
            <th style={{textAlign:'left',padding:8}}>Nome</th>
            <th style={{textAlign:'left',padding:8}}>Email</th>
            <th style={{textAlign:'left',padding:8}}>Role</th>
            <th style={{textAlign:'left',padding:8}}>Estado</th>
            <th style={{textAlign:'left',padding:8}}>Criado</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderTop:'1px solid var(--border)' }}>
              <td style={{padding:8}}>{u.name ?? '—'}</td>
              <td style={{padding:8}}>{u.email}</td>
              <td style={{padding:8}}>{u.role}</td>
              <td style={{padding:8}}>{u.status}</td>
              <td style={{padding:8}}>{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
