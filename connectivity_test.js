// Teste de conectividade para debug
console.log('🧪 Iniciando teste de conectividade...');

// URLs para testar
const testUrls = [
  "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy.eastus2.azure.neon.tech/neondb?sslmode=require",
  "postgresql://neondb_owner:npg_XiMhD30dyHsj@ep-winter-term-a8165fiy-pooler.eastus2.azure.neon.tech/neondb?ssl=true"
];

async function testConnectivity() {
  if (typeof window === 'undefined') {
    console.log('❌ Teste deve ser executado no browser');
    return;
  }

  console.log('🔍 Testando URLs disponíveis...');
  
  // Teste básico de fetch
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\n🔗 Testando URL ${i + 1}: ${url.substring(0, 50)}...`);
    
    try {
      // Extrair endpoint para teste HTTP básico
      const matches = url.match(/\/\/([^:]+:[^@]+@)?([^\/]+)/);
      if (matches && matches[2]) {
        const endpoint = matches[2].split('@')[1] || matches[2];
        const testEndpoint = `https://${endpoint.replace(':5432', '')}`;
        
        console.log(`🌐 Testando endpoint HTTP: ${testEndpoint}`);
        
        const response = await fetch(testEndpoint, {
          method: 'HEAD',
          mode: 'no-cors', // Evitar problemas de CORS
          timeout: 5000
        });
        
        console.log(`✅ Endpoint ${i + 1} acessível`);
      }
    } catch (error) {
      console.log(`❌ Endpoint ${i + 1} não acessível:`, error.message);
    }
  }

  // Teste do RealTimeConnector se disponível
  if (window.realTimeConnector) {
    console.log('\n🔧 Testando RealTimeConnector...');
    
    try {
      const status = window.realTimeConnector.getStatus();
      console.log('Status atual:', status);
      
      console.log('🔄 Forçando health check...');
      const healthResult = await window.realTimeConnector.forceReconnection();
      console.log('Health check result:', healthResult);
      
    } catch (error) {
      console.error('❌ Erro ao testar RealTimeConnector:', error);
    }
  }

  // Teste do serviço de agendamentos se disponível
  if (window.agendamentoRealTimeService) {
    console.log('\n📋 Testando serviço de agendamentos...');
    
    try {
      const healthResult = await window.agendamentoRealTimeService.healthCheck();
      console.log('Health check serviço:', healthResult);
      
    } catch (error) {
      console.error('❌ Erro ao testar serviço:', error);
    }
  }

  console.log('\n🎯 Teste de conectividade concluído!');
}

// Executar após carregamento
if (typeof window !== 'undefined') {
  setTimeout(testConnectivity, 3000);
} else {
  console.log('Execute no browser console: testConnectivity()');
  window.testConnectivity = testConnectivity;
}
