# Roteiro Manual — Planos (Área Administrativa)

## Guarda de administrador nos endpoints `/api/admin/plans/**`

1. Iniciar sessão como **ADMIN** e confirmar que as acções de gestão de planos (criar, actualizar, clonar, reordenar blocos e gerir exercícios) continuam a funcionar sem erros.
2. Terminar sessão ou expirar a sessão (por exemplo, limpar cookies) e tentar reordenar blocos a partir do PlanEditor. Confirmar resposta **401 Unauthorized** e que o cliente apresenta mensagem a solicitar nova sessão administrativa.
3. Iniciar sessão como utilizador com papel **PT** e repetir a tentativa de reordenar blocos, criar plano ou alterar exercícios. Confirmar resposta **403 Forbidden** em cada chamada e mensagem de acesso negado no PlanEditor.
4. Iniciar sessão como utilizador com papel **CLIENT** e repetir as tentativas acima. Confirmar que as chamadas são travadas com **403 Forbidden** e nenhuma alteração é persistida.
5. Regressar à sessão **ADMIN** e validar que a auditoria (`audit_logs`) regista correctamente as acções bem sucedidas com o ID do actor.

> Nota: Sempre que os testes forem executados em ambiente local, garantir que as variáveis de ambiente do Supabase estão configuradas para permitir as chamadas autenticadas com guardas de administrador.
