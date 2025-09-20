// src/app/api/admin/assign-pt/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const s = await getSessionUserSafe(); if(!s?.user?.id || s.user.role !== 'ADMIN') return NextResponse.json({ ok:false }, { status:401 });
  const body = await req.json(); // { user_id, trainer_id }
  const sb = createServerClient();

  // cria/atualiza relação trainer_clients
  const { error } = await sb.from('trainer_clients').upsert({
    trainer_id: body.trainer_id, client_id: body.user_id
  }, { onConflict: 'trainer_id,client_id' });
  if (error) return NextResponse.json({ ok:false }, { status:500 });

  // notificar PT
  try{
    await sb.from('notifications').insert({
      user_id: body.trainer_id,
      title: 'Novo cliente atribuído',
      body: 'Foi-te atribuído um cliente.',
      read: false,
      href: '/dashboard/pt/clients'
    });
  }catch{}

  return NextResponse.json({ ok:true });
}
