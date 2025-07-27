// src/lib/auth-server.ts

/**
 * Exemplo de stub para obter sessão de utilizador no servidor.
 * Substitua esta implementação pela lógica de autenticação real.
 */

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function getAuthSession(): Promise<AuthSession | null> {
  // TODO: implementar a validação de cookies / tokens
  // Exemplo de retorno nulo (não autenticado)
  return null;
}
