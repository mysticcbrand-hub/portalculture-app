import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDB() {
  console.log('🔍 Verificando base de datos...\n');
  
  // Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .from('knowledge_base')
    .select('id')
    .limit(1);
  
  if (tablesError) {
    console.log('❌ Error:', tablesError.message);
    console.log('\n💡 Posibles causas:');
    console.log('1. La tabla no existe → Ejecuta supabase-setup.sql');
    console.log('2. RLS está bloqueando → Usa service_role_key en el script');
    return;
  }
  
  console.log('✅ Tabla knowledge_base existe');
  
  // Check extensions
  const { data: extensions } = await supabase
    .rpc('pg_extension')
    .select('*');
  
  console.log('📊 Extensiones:', extensions);
  
  // Check function exists
  const { data: functions, error: funcError } = await supabase
    .rpc('match_knowledge', {
      query_embedding: new Array(1536).fill(0),
      match_threshold: 0.7,
      match_count: 1
    });
  
  if (funcError) {
    console.log('❌ Función match_knowledge no existe:', funcError.message);
  } else {
    console.log('✅ Función match_knowledge existe');
  }
}

testDB().catch(console.error);
