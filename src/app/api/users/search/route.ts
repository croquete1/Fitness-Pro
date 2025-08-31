import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/search?role=TRAINER|CLIENT|ADMIN&q=texto
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role')?.toUpperCase() as
      | 'ADMIN'
      | 'TRAINER'
      | 'CLIENT'
      | undefined;
    const q = (searchParams.get('q') || '').trim();

    // where dinâmico
    const where: any = {};
    if (role === 'ADMIN' || role === 'TRAINER' || role === 'CLIENT') {
      where.role = role;
    }
    if (q.length >= 2) {
      where.OR = [
        { name:  { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      // ⚠️ Só campos que existem no schema; não incluir `phone`
      select: {
        id: true,
        name: true,
        email: true,
        role: true,          // podes remover se não precisares no cliente
        // phoneNumber: true, // se precisares, descomenta isto (existe no schema)
      },
      take: 15,
      orderBy: { name: 'asc' },
    });

    // O componente do cliente espera { id, name, email? }
    const payload = users.map(u => ({
      id: u.id,
      name: u.name ?? '',
      email: u.email ?? undefined,
      // Se um dia quiseres enviar telefone:
      // phone: (u as any).phoneNumber ?? undefined,
      // role: u.role,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[/api/users/search] error:', err);
    return NextResponse.json({ error: 'Erro ao procurar utilizadores' }, { status: 500 });
  }
}
