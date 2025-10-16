# Sincronização com Supabase

Os endpoints de antropometria recorrem ao helper partilhado `src/app/api/anthropometry/_helpers.ts`, que tenta automaticamente as diferentes combinações de colunas (`user_id`/`client_id`, `measured_at`/`date`) antes de falhar, garantindo compatibilidade com o esquema actual do Supabase sem necessidade de alterações no SQL editor.

Como resultado, não são necessários scripts de migração adicionais neste momento.
