// Teste de conectividade do Builder PostgreSQL
// Execute com: node test-builder-connectivity.js

const { neon } = require('@neondatabase/serverless');

const BUILDER_DATABASE_URL = "postgresql://neondb_owner:npg_kMKTA7G5Bzja@ep-calm-paper-acvhq0vs-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function testBuilderConnection() {
  console.log('🔄 Testando conectividade com Builder PostgreSQL...');
  
  try {
    const sql = neon(BUILDER_DATABASE_URL);
    
    console.log('1. Teste básico de conexão...');
    const basicTest = await sql`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Conexão básica OK:', basicTest[0]);
    
    console.log('2. Teste de informações do banco...');
    const dbInfo = await sql`
      SELECT 
        version() as pg_version, 
        current_database() as db_name, 
        current_user as user_name,
        current_schema() as schema_name
    `;
    console.log('✅ Informações do banco:', dbInfo[0]);
    
    console.log('3. Teste de listagem de tabelas...');
    const tables = await sql`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    console.log('📋 Tabelas existentes:', tables);
    
    console.log('4. Teste de criação de tabela temporária...');
    await sql`
      CREATE TABLE IF NOT EXISTS test_connectivity (
        id SERIAL PRIMARY KEY,
        test_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela de teste criada');
    
    console.log('5. Teste de inserção...');
    const insertResult = await sql`
      INSERT INTO test_connectivity (test_message) 
      VALUES ('Builder PostgreSQL conectividade OK') 
      RETURNING *
    `;
    console.log('✅ Insert OK:', insertResult[0]);
    
    console.log('6. Teste de consulta...');
    const selectResult = await sql`
      SELECT * FROM test_connectivity 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    console.log('✅ Select OK:', selectResult[0]);
    
    console.log('7. Limpeza - removendo tabela de teste...');
    await sql`DROP TABLE test_connectivity`;
    console.log('✅ Limpeza concluída');
    
    console.log('\n🎉 BUILDER POSTGRESQL CONECTIVIDADE: SUCESSO!');
    console.log('✅ Banco pronto para migração');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro na conectividade:', error);
    console.error('Detalhes:', {
      message: error.message,
      code: error.code,
      severity: error.severity
    });
    return false;
  }
}

// Executar teste
testBuilderConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Teste concluído com SUCESSO');
      process.exit(0);
    } else {
      console.log('\n❌ Teste FALHOU');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Erro crítico:', error);
    process.exit(1);
  });
