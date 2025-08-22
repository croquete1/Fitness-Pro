// src/lib/admin/approvalsRepo.ts
import { prisma } from '@/lib/prisma';

export type ApprovalItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string; // ISO
};

/**
 * Lista contas com status PENDING para aprovação.
 * Se o schema divergir, ajusta o select/where aqui (mantém a API estável).
 */
export async function listPendingApprovals(): Promise<ApprovalItem[]> {
  try {
    const rows = await prisma.user.findMany({
      where: { status: 'PENDING' as any },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    return rows.map((r) => ({
      id: r.id,
      name: r.name ?? null,
      email: r.email ?? null,
      role: (r.role as any) ?? 'CLIENT',
      status: (r.status as any) ?? 'PENDING',
      createdAt: (r as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    }));
  } catch (e) {
    // fallback seguro (não quebra a navegação)
    return [];
  }
}
