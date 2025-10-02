// Teste completo do sistema híbrido
// Este script pode ser executado no console do browser

console.log('🚀 Testando Sistema Híbrido de Banco de Dados');

// Função para testar as funcionalidades
async function testHybridSystem() {
  try {
    console.log('\n=== 1. VERIFICANDO STATUS DO SISTEMA ===');
    
    // Testar se as funções estão disponíveis
    if (typeof window.debugHybridDB === 'function') {
      console.log('✅ Debug functions disponíveis');
      const status = window.debugHybridDB();
      console.log('📊 Status atual:', status);
    } else {
      console.log('⚠️ Debug functions não encontradas - aguardando inicialização...');
    }

    console.log('\n=== 2. TESTANDO CONECTIVIDADE ===');
    
    // Verificar se o sistema híbrido está funcionando
    if (typeof window.hybridDBStatus !== 'undefined') {
      console.log('📡 Sistema Híbrido Status:', window.hybridDBStatus);
    }

    // Testar carregamento de agendamentos
    if (typeof window.getAgendamentosHybrid === 'function') {
      console.log('\n=== 3. TESTANDO CARREGAMENTO DE DADOS ===');
      try {
        const agendamentos = await window.getAgendamentosHybrid('default-user');
        console.log(`✅ Agendamentos carregados: ${agendamentos.length} registros`);
        if (agendamentos.length > 0) {
          console.log('📋 Primeiro agendamento:', agendamentos[0]);
        }
      } catch (error) {
        console.log('❌ Erro ao carregar agendamentos:', error.message);
      }
    }

    console.log('\n=== 4. TESTANDO CACHE ===');
    
    if (typeof window.clearHybridCache === 'function') {
      console.log('🧹 Limpando cache...');
      window.clearHybridCache();
      console.log('✅ Cache limpo');
    }

    console.log('\n=== 5. VERIFICAÇÕES FINAIS ===');
    
    // Verificar IndexedDB
    if ('indexedDB' in window) {
      console.log('✅ IndexedDB suportado pelo browser');
      
      // Tentar abrir o banco local
      const request = indexedDB.open('BellaSalonDB', 1);
      request.onsuccess = () => {
        console.log('✅ Banco IndexedDB acessível');
        const db = request.result;
        console.log('📋 Object stores:', Array.from(db.objectStoreNames));
        db.close();
      };
      request.onerror = () => {
        console.log('❌ Erro ao acessar IndexedDB:', request.error);
      };
    } else {
      console.log('❌ IndexedDB não suportado');
    }

    console.log('\n🎉 TESTE COMPLETO FINALIZADO');
    console.log('💡 Use as seguintes funções de debug:');
    console.log('   - window.debugHybridDB() - Status do sistema');
    console.log('   - window.debugHybridHook() - Status do hook React');
    console.log('   - window.clearHybridCache() - Limpar cache');
    console.log('   - window.getAgendamentosHybrid("user-id") - Carregar dados');

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Aguardar um pouco e executar teste
setTimeout(testHybridSystem, 2000);

// Tornar função disponível globalmente
window.testHybridSystem = testHybridSystem;

console.log('⏳ Aguardando 2 segundos para inicialização...');
console.log('💡 Ou execute manualmente: window.testHybridSystem()');
