// Teste simples para verificar runtime
console.log('🔍 Testando runtime...');

try {
  // Verificar se os sistemas sempre online estão disponíveis
  if (typeof window !== 'undefined') {
    console.log('✅ Window disponível');
    
    if (window.alwaysOnlineService) {
      console.log('✅ alwaysOnlineService disponível');
      const status = window.alwaysOnlineService.getStatus();
      console.log('Status:', status);
    } else {
      console.log('⚠️ alwaysOnlineService não disponível ainda');
    }
    
    if (window.alwaysOnlineConnector) {
      console.log('✅ alwaysOnlineConnector disponível');
    } else {
      console.log('⚠️ alwaysOnlineConnector não disponível');
    }
  }
  
  console.log('✅ Teste de runtime concluído sem erros');
} catch (error) {
  console.error('❌ Erro de runtime detectado:', error);
}
