// Teste para detectar problemas de Failed to fetch
console.log('🧪 Iniciando teste de conectividade...');

// Função para testar conectividade básica
async function testBasicConnectivity() {
  console.log('🌐 Testando conectividade básica...');
  
  try {
    // Teste 1: Navigator online
    console.log('📶 Navigator online:', navigator.onLine);
    
    // Teste 2: Fetch simples
    const response = await fetch('https://www.google.com', { 
      mode: 'no-cors',
      signal: AbortSignal.timeout(5000)
    });
    console.log('✅ Fetch básico funcionando');
    
    // Teste 3: Verificar always online service
    if (typeof window !== 'undefined' && window.alwaysOnlineService) {
      console.log('🔍 Testando always online service...');
      const status = window.alwaysOnlineService.getStatus();
      console.log('Status do serviço:', status);
      
      try {
        await window.alwaysOnlineService.testConnection();
        console.log('✅ Always online service funcionando');
      } catch (serviceError) {
        console.error('❌ Always online service com problemas:', serviceError.message);
      }
    } else {
      console.log('⚠️ Always online service não disponível');
    }
    
  } catch (error) {
    console.error('❌ Problema de conectividade detectado:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });
    
    if (error.message.includes('Failed to fetch')) {
      console.log('🚨 FAILED TO FETCH DETECTADO!');
      console.log('Possíveis causas:');
      console.log('- Problemas de rede/internet');
      console.log('- CORS bloqueado');
      console.log('- Timeout de conexão');
      console.log('- URL de banco inválida');
    }
  }
}

// Executar teste
testBasicConnectivity();

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  window.testConnectivity = testBasicConnectivity;
  console.log('🔧 Comando disponível: window.testConnectivity()');
}
