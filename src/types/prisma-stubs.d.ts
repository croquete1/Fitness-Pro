// Stub seguro para remover erros de tipo quando alguém importou '@prisma/client'
declare module '@prisma/client' {
  export type Role = 'ADMIN' | 'PT' | 'CLIENT' | 'TRAINER';
  export type Status = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  export class PrismaClient {}
}
