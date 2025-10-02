// Teste de conectividade Builder PostgreSQL
import { testConnection } from './lib/builderPostgres.js';

console.log('🔄 Iniciando teste de conectividade Builder PostgreSQL...');

async function runTest() {
  try {
    const result = await testConnection();
    
    if (result.success) {
      console.log('✅ BUILDER POSTGRESQL: Conectividade OK!');
      console.log('Detalhes:', result.details);
      
      // Adicionar função de teste global para debug
      if (typeof window !== 'undefined') {
        window.testBuilderDB = testConnection;
        console.log('🔧 Debug: Use window.testBuilderDB() para testar a conexão');
      }
      
      return true;
    } else {
      console.error('❌ BUILDER POSTGRESQL: Falha na conectividade');
      console.error('Erro:', result.error);
      return false;
    }
  } catch (error) {
    console.error('💥 BUILDER POSTGRESQL: Erro crítico:', error);
    return false;
  }
}

// Auto-executar se estiver no browser
if (typeof window !== 'undefined') {
  runTest();
}

export { runTest };
