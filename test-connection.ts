import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Carrega as variáveis de .env.local
config()

// Inicializa o cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

async function testConnection() {
  // Tenta buscar até 1 registro da tabela "users"
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  console.log('Data:', data)
  console.log('Error:', error)
}

testConnection().catch(err => {
  console.error('Falha no teste de conexão:', err)
})
