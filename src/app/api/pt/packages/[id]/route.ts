// src/app/api/pt/packages/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { AppRole } from '@/lib/roles';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

export async function GET(
  _req: Request, // underscore evita @typescript-eslint/no-unused-vars
  { params }: { params: { id: string } }
) {
  // 1) Auth
  const session = await getServerSession(authOptions);
  const rawUser = session?.user;
  if (!rawUser?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2) Role normalizada da App
  const role = toAppRole((rawUser as any).role);
  if (!role) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3) Viewer
  const me: { id: string; role: AppRole } = { id: String(rawUser.id), role };

  // 4) Autorização: apenas ADMIN/PT
  if (!isAdmin(me.role) && !isPT(me.role)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 5) Resposta (placeholder; liga ao prisma quando necessário)
  const clientId = params.id;
  return NextResponse.json({
    ok: true,
    viewer: { id: me.id, role: me.role },
    clientId,
  });
}
