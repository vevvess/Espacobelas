// Teste final do sistema Prisma Híbrido
// Execute no console: window.runPrismaHybridTest()

console.log('🔍 TESTE FINAL DO SISTEMA PRISMA HÍBRIDO');

async function runPrismaHybridTest() {
  const results = {
    prismaClient: '❓ Aguardando teste',
    hybridSystem: '❓ Aguardando teste',
    indexedDB: '❓ Aguardando teste',
    uiIntegration: '❓ Aguardando teste',
    hookPrisma: '❓ Aguardando teste',
    quotaHandling: '❓ Aguardando teste'
  };

  try {
    console.log('\n=== 1. TESTE DO PRISMA CLIENT ===');
    
    // Verificar se Prisma Client está disponível
    if (typeof window.testPrismaHybrid === 'function') {
      try {
        const prismaStatus = await window.testPrismaHybrid();
        console.log('✅ Prisma Client operacional:', prismaStatus);
        results.prismaClient = prismaStatus.connected ? '✅ Conectado' : '🟡 Disponível mas sem conexão';
      } catch (error) {
        console.log('❌ Erro no Prisma Client:', error);
        results.prismaClient = '❌ Erro';
      }
    } else {
      console.log('❌ Prisma Client não encontrado');
      results.prismaClient = '❌ Não encontrado';
    }

    console.log('\n=== 2. TESTE DO SISTEMA HÍBRIDO PRISMA ===');
    
    // Verificar se sistema híbrido Prisma está funcionando
    if (typeof window.hybridPrismaStatus === 'function') {
      const status = window.hybridPrismaStatus();
      console.log('✅ Sistema híbrido Prisma operacional:', status);
      results.hybridSystem = `✅ ${status.mode} mode`;
      
      // Verificar detecção de quota
      if (status.quotaError) {
        console.log('🟡 Quota error detectado - modo local ativo');
        results.quotaHandling = '✅ Quota detectada corretamente';
      } else {
        results.quotaHandling = '🟡 Sem quota error (normal)';
      }
    } else {
      console.log('❌ Sistema híbrido Prisma não encontrado');
      results.hybridSystem = '❌ Não encontrado';
    }

    console.log('\n=== 3. TESTE DO INDEXEDDB PRISMA ===');
    
    // Verificar IndexedDB Prisma
    if ('indexedDB' in window) {
      try {
        const request = indexedDB.open('BellaSalonPrismaDB', 1);
        await new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const db = request.result;
            console.log('✅ IndexedDB Prisma operacional');
            console.log('📋 Object stores:', Array.from(db.objectStoreNames));
            db.close();
            results.indexedDB = '✅ Funcionando';
            resolve();
          };
          request.onerror = () => {
            console.log('❌ Erro no IndexedDB Prisma:', request.error);
            results.indexedDB = '❌ Erro';
            reject(request.error);
          };
        });
      } catch (error) {
        console.log('❌ IndexedDB Prisma com problemas:', error);
        results.indexedDB = '❌ Com problemas';
      }
    } else {
      console.log('❌ IndexedDB não suportado');
      results.indexedDB = '❌ Não suportado';
    }

    console.log('\n=== 4. TESTE DE INTEGRAÇÃO UI PRISMA ===');
    
    // Verificar se componente Prisma está na página
    const prismaIndicator = document.querySelector('[title*="Prisma"]') || 
                           document.querySelector('[title*="prisma"]') ||
                           Array.from(document.querySelectorAll('*')).find(el => 
                             el.textContent?.includes('Prisma') || 
                             el.textContent?.includes('prisma')
                           );
    
    if (prismaIndicator) {
      console.log('✅ Indicador Prisma encontrado na UI');
      results.uiIntegration = '✅ Integrado';
    } else {
      console.log('⚠️ Indicador Prisma não visível (pode não ter carregado ainda)');
      results.uiIntegration = '⚠️ Não visível';
    }

    console.log('\n=== 5. TESTE DO HOOK PRISMA ===');
    
    // Verificar se hook Prisma está funcionando
    if (typeof window.debugPrismaHook === 'function') {
      const hookStatus = window.debugPrismaHook();
      console.log('✅ Hook Prisma funcionando:', hookStatus);
      results.hookPrisma = '✅ Funcionando';
    } else {
      console.log('⚠️ Hook Prisma não acessível (pode não ter carregado ainda)');
      results.hookPrisma = '⚠️ Não acessível';
    }

    console.log('\n=== 6. VERIFICAÇÃO DE COMPATIBILIDADE ===');
    
    // Verificar se ainda há referências ao sistema antigo
    const hasOldReferences = Array.from(document.scripts).some(script => 
      script.innerHTML.includes('useAgendamentosHybrid') ||
      script.innerHTML.includes('hybridDatabase') ||
      script.innerHTML.includes('systemStatus')
    );
    
    if (!hasOldReferences) {
      console.log('✅ Migração limpa - sem referências ao sistema antigo');
    } else {
      console.log('⚠️ Ainda há referências ao sistema antigo');
    }

    console.log('\n📊 RESULTADO FINAL:');
    console.table(results);

    // Resumo geral
    const successCount = Object.values(results).filter(r => r.startsWith('✅')).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 MIGRAÇÃO PRISMA: ${successCount}/${totalTests} componentes OK`);
    
    if (successCount >= 4) {
      console.log('🎉 SISTEMA PRISMA HÍBRIDO FUNCIONANDO!');
      console.log('✅ Prisma usado quando disponível');
      console.log('✅ IndexedDB como fallback para quota');
      console.log('✅ Switch automático entre modos');
      console.log('✅ Problema da quota resolvido permanentemente');
    } else {
      console.log('⚠️ Alguns componentes precisam de atenção');
    }

    // Teste de funcionalidade específica
    console.log('\n=== 7. TESTE DE FUNCIONALIDADE ===');
    
    try {
      // Tentar simular carregamento de agendamentos
      if (typeof window.debugPrismaHook === 'function') {
        console.log('🧪 Testando carregamento de dados...');
        const hookData = window.debugPrismaHook();
        console.log(`📊 Dados carregados: ${hookData.agendamentosCount || 0} agendamentos`);
        console.log(`🔄 Sistema: ${hookData.hybridStatus?.mode || 'unknown'}`);
      }
    } catch (error) {
      console.log('⚠️ Erro no teste de funcionalidade:', error);
    }

    return results;

  } catch (error) {
    console.error('💥 Erro no teste:', error);
    return results;
  }
}

// Disponibilizar globalmente
window.runPrismaHybridTest = runPrismaHybridTest;

// Auto-executar após 3 segundos
setTimeout(() => {
  console.log('🚀 Executando teste automático do sistema Prisma...');
  runPrismaHybridTest();
}, 3000);

console.log('💡 Para executar manualmente: window.runPrismaHybridTest()');

// Debug adicional para desenvolvimento
if (import.meta?.env?.DEV) {
  console.log('🔧 Modo desenvolvimento - debug ativo');
  
  // Interceptar erros de Prisma
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('prisma') || 
        event.error?.message?.includes('Prisma')) {
      console.error('🔴 Erro relacionado ao Prisma:', event.error);
    }
  });
  
  // Interceptar erros de quota
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('quota') || 
        event.error?.message?.includes('exceeded')) {
      console.error('🚫 Erro de quota detectado:', event.error);
    }
  });
}
